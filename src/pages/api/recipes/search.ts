import * as marked from 'marked'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NumberField, StringArrayField, StringField, Unbody } from 'unbody'
import { z } from 'zod'

const u = new Unbody({
  apiKey: process.env.UNBODY_API_KEY!,
  projectId: process.env.UNBODY_PROJECT_ID!,
})

export type ParsedQuery = {
  query: string
  concepts: string[]
  includeIngredients?: string[]
  excludeIngredients?: string[]
  includeCuisineTypes?: string[]
  totalTimeMinutesMax?: number | undefined
}

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

const parseQuery = async (query: string) => {
  const {
    data: { payload },
  } = await u.generate.json(
    [
      {
        role: 'system',
        content:
          "Analyze the user's query and history of queries to determine the user's intent and preferences.",
      },
      {
        role: 'user',
        content: query,
      },
    ],
    {
      schema: z.object({
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
        includeCuisineTypes: z
          .array(z.string())
          .nullable()
          .describe(
            "Cuisine types that the user wants to include in the search results. e.g., 'italian', 'mexican', 'chinese'."
          ),
        totalTimeMinutesMax: z
          .number()
          .nullable()
          .describe('Maximum total time in minutes.'),
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
    .where(({ And, ContainsAll, NotEqual, LessThanEqual }) =>
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

        ...(parsed.includeCuisineTypes
          ? [
              {
                cuisineTypes: ContainsAll(parsed.includeCuisineTypes),
              },
            ]
          : []),

        ...(parsed.totalTimeMinutesMax && parsed.totalTimeMinutesMax > 0
          ? [
              {
                totalTimeMinutes: LessThanEqual(
                  parsed.totalTimeMinutesMax + 0.0001
                ),
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
    answer: await marked.parse(generate.result || ''),
    recipes: payload.map((recipe) => ({
      ...recipe,
      text: marked.parse((recipe.text || '') as string, { async: false }),
    })) as any,
  })
}
