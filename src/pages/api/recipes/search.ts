import * as marked from 'marked'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NumberField, StringArrayField, StringField, Unbody } from 'unbody'
import { z } from 'zod'
import type { Data as ParsedQuery } from './parse'

const u = new Unbody({
  apiKey: process.env.UNBODY_API_KEY!,
  projectId: process.env.UNBODY_PROJECT_ID!,
})

export type RequestParams = {
  query: string
}

export type Data = {
  answer: string
  query: ParsedQuery
  recipes: {
    id: string
    title: string
    text: string
    description: string
    ingredients: string[]
    servings: number
    prepTimeMinutes: number
    cookTimeMinutes: number
    totalTimeMinutes: number
    mealTypes: string[]
    courseTypes: string[]
    cuisineTypes: string[]
    seasons: string[]
    allergens: string[]
  }[]
}

type RecipeCollection = {
  title: StringField
  text: StringField
  ingredients: StringArrayField
  mealTypes: StringArrayField
  courseTypes: StringArrayField
  cuisineTypes: StringArrayField
  seasons: StringArrayField
  allergens: StringArrayField
  prepTimeMinutes: NumberField
  cookTimeMinutes: NumberField
  totalTimeMinutes: NumberField
  servings: NumberField
}

const parseQuery = async (query: string, history?: any[]) => {
  const {
    data: { payload },
  } = await u.generate.json(
    [
      {
        role: 'system',
        content:
          "Analyze the user's query and history of queries to determine the user's intent and preferences.",
      },
      ...(history || []).flatMap((item) => [
        {
          role: 'user' as 'user',
          content: item.query,
        },
        {
          role: 'assistant' as 'assistant',
          content: JSON.stringify({ ...item, query: undefined }),
        },
      ]),
      {
        role: 'user',
        content: query,
      },
    ],
    {
      schema: z.object({
        queryTitle: z
          .string()
          .describe(
            "A descriptive and engaging title for the user's query e.g., Quick and Easy Dinner Recipes."
          ),
        intent: z
          .enum(['search', 'question'])
          .describe(
            "The user's intent: 'search' if they want to search for recipes or 'question' if they have a question about the returned recipes."
          ),
        concepts: z
          .array(z.string())
          .describe('Search terms that the user is interested in.'),
        includeIngredients: z
          .array(z.string())
          .nullable()
          .describe(
            'Ingredients that the user wants to include in the search results.'
          ),
        excludeIngredients: z
          .array(z.string())
          .nullable()
          .describe(
            'Ingredients that the user wants to exclude from the search results.'
          ),
        includeMealTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Meal types that the user wants to include in the search results. e.g., 'breakfast', 'lunch', 'dinner'."
          ),
        excludeMealTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Meal types that the user wants to exclude from the search results. e.g., 'breakfast', 'lunch', 'dinner'."
          ),
        includeCourseTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Course types that the user wants to include in the search results. e.g., 'appetizer', 'main', 'dessert'."
          ),
        excludeCourseTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Course types that the user wants to exclude from the search results. e.g., 'appetizer', 'main', 'dessert'."
          ),
        includeCuisineTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Cuisine types that the user wants to include in the search results. e.g., 'italian', 'mexican', 'chinese'."
          ),
        excludeCuisineTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Cuisine types that the user wants to exclude from the search results. e.g., 'italian', 'mexican', 'chinese'."
          ),
        includeSeasons: z
          .array(z.string())
          .nullable()
          .describe(
            "Seasons in which the user typically cooks. e.g., 'summer', 'winter'."
          ),
        excludeSeasons: z
          .array(z.string())
          .nullable()
          .describe(
            "Seasons in which the user typically does not cook. e.g., 'summer', 'winter'."
          ),
        prepTimeMinutesMax: z
          .number()
          .nullable()
          .describe('Maximum preparation time in minutes.'),
        cookTimeMinutesMax: z
          .number()
          .nullable()
          .describe('Maximum cooking time in minutes.'),
        totalTimeMinutesMax: z
          .number()
          .nullable()
          .describe('Maximum total time in minutes.'),
        servingsMin: z
          .number()
          .nullable()
          .describe('Minimum number of servings.'),
        servingsMax: z
          .number()
          .nullable()
          .describe('Maximum number of servings.'),
        excludeAllergens: z
          .array(z.string())
          .nullable()
          .default([])
          .describe(
            "Allergens that the user wants to exclude from the search results. e.g., 'peanuts', 'dairy'."
          ),
      }),
    }
  )

  return {
    query,
    ...payload.content,
  } as ParsedQuery
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query } = req.body as RequestParams

  const parsed = await parseQuery(query)

  const {
    data: { payload, generate },
  } = await u.get
    .collection<RecipeCollection>('RecipeCollection')
    .additional('id')
    .select(
      'title',
      'text',
      'ingredients',
      'mealTypes',
      'courseTypes',
      'cuisineTypes',
      'seasons',
      'allergens',
      'prepTimeMinutes',
      'cookTimeMinutes',
      'totalTimeMinutes',
      'servings'
    )
    .search.about(
      parsed.concepts && parsed.concepts.length > 0
        ? parsed.concepts
        : parsed.query
    )
    .autocut(3)
    .where(({ And, ContainsAll, NotEqual, LessThanEqual, GreaterThanEqual }) =>
      And(
        ...(parsed.includeIngredients
          ? [
              {
                ingredients: ContainsAll(parsed.includeIngredients),
              },
            ]
          : []),
        ...(parsed.excludeIngredients
          ? parsed.excludeIngredients.map((ing) => ({
              ingredients: NotEqual(ing),
            }))
          : []),

        ...(parsed.includeMealTypes
          ? [
              {
                mealTypes: ContainsAll(parsed.includeMealTypes),
              },
            ]
          : []),
        ...(parsed.excludeMealTypes
          ? parsed.excludeMealTypes.map((ing) => ({
              mealTypes: NotEqual(ing),
            }))
          : []),

        ...(parsed.includeCourseTypes
          ? [
              {
                courseTypes: ContainsAll(parsed.includeCourseTypes),
              },
            ]
          : []),
        ...(parsed.excludeCourseTypes
          ? parsed.excludeCourseTypes.map((ing) => ({
              courseTypes: NotEqual(ing),
            }))
          : []),

        ...(parsed.includeCuisineTypes
          ? [
              {
                cuisineTypes: ContainsAll(parsed.includeCuisineTypes),
              },
            ]
          : []),
        ...(parsed.excludeCuisineTypes
          ? parsed.excludeCuisineTypes.map((ing) => ({
              cuisineTypes: NotEqual(ing),
            }))
          : []),

        ...(parsed.includeSeasons
          ? [
              {
                seasons: ContainsAll(parsed.includeSeasons),
              },
            ]
          : []),
        ...(parsed.excludeSeasons
          ? parsed.excludeSeasons.map((ing) => ({
              seasons: NotEqual(ing),
            }))
          : []),

        ...(parsed.excludeAllergens
          ? parsed.excludeAllergens.map((ing) => ({
              allergens: NotEqual(ing),
            }))
          : []),

        ...(parsed.cookTimeMinutesMax && parsed.cookTimeMinutesMax > 0
          ? [
              {
                cookTimeMinutes: LessThanEqual(
                  parsed.cookTimeMinutesMax + 0.0001
                ),
              },
            ]
          : []),
        ...(parsed.prepTimeMinutesMax && parsed.prepTimeMinutesMax > 0
          ? [
              {
                prepTimeMinutes: LessThanEqual(
                  parsed.prepTimeMinutesMax + 0.0001
                ),
              },
            ]
          : []),
        ...(parsed.servingsMax && parsed.servingsMax > 0
          ? [
              {
                servings: LessThanEqual(parsed.servingsMax + 0.0001),
              },
            ]
          : []),
        ...(parsed.servingsMin && parsed.servingsMin > 0
          ? [
              {
                servings: GreaterThanEqual(parsed.servingsMin - 0.0001),
              },
            ]
          : [])
      )
    )
    .generate.fromMany({
      messages: [
        {
          role: 'system',
          content:
            "Generate a response to the user's query based on the search results. \n RESULTS: {$}",
        },
        {
          role: 'user',
          content: parsed.query,
        },
      ],
    })
    .exec()

  return res.status(200).json({
    query: parsed,
    answer: await marked.parse(generate.result),
    recipes: payload.map((recipe) => ({
      ...recipe,
      text: marked.parse(recipe.text as string, { async: false }),
    })) as any,
  })
}
