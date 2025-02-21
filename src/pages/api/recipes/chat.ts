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
  query: ParsedQuery
  history?: Data[]
}

export type Data = {
  answer: string
  query: ParsedQuery
  recipes: {
    id: string
    title: string
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query, history = [] } = req.body as RequestParams

  const intent = query.intent || 'search'

  const results =
    intent === 'search'
      ? await u.get
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
            query.concepts && query.concepts.length > 0
              ? query.concepts
              : query.query
          )
          .autocut(3)
          .where(
            ({ And, ContainsAll, NotEqual, LessThanEqual, GreaterThanEqual }) =>
              And(
                ...(query.includeIngredients
                  ? [
                      {
                        ingredients: ContainsAll(query.includeIngredients),
                      },
                    ]
                  : []),
                ...(query.excludeIngredients
                  ? query.excludeIngredients.map((ing) => ({
                      ingredients: NotEqual(ing),
                    }))
                  : []),

                ...(query.includeMealTypes
                  ? [
                      {
                        mealTypes: ContainsAll(query.includeMealTypes),
                      },
                    ]
                  : []),
                ...(query.excludeMealTypes
                  ? query.excludeMealTypes.map((ing) => ({
                      mealTypes: NotEqual(ing),
                    }))
                  : []),

                ...(query.includeCourseTypes
                  ? [
                      {
                        courseTypes: ContainsAll(query.includeCourseTypes),
                      },
                    ]
                  : []),
                ...(query.excludeCourseTypes
                  ? query.excludeCourseTypes.map((ing) => ({
                      courseTypes: NotEqual(ing),
                    }))
                  : []),

                ...(query.includeCuisineTypes
                  ? [
                      {
                        cuisineTypes: ContainsAll(query.includeCuisineTypes),
                      },
                    ]
                  : []),
                ...(query.excludeCuisineTypes
                  ? query.excludeCuisineTypes.map((ing) => ({
                      cuisineTypes: NotEqual(ing),
                    }))
                  : []),

                ...(query.includeSeasons
                  ? [
                      {
                        seasons: ContainsAll(query.includeSeasons),
                      },
                    ]
                  : []),
                ...(query.excludeSeasons
                  ? query.excludeSeasons.map((ing) => ({
                      seasons: NotEqual(ing),
                    }))
                  : []),

                ...(query.excludeAllergens
                  ? query.excludeAllergens.map((ing) => ({
                      allergens: NotEqual(ing),
                    }))
                  : []),

                ...(query.cookTimeMinutesMax && query.cookTimeMinutesMax > 0
                  ? [
                      {
                        cookTimeMinutes: LessThanEqual(
                          query.cookTimeMinutesMax + 0.0001
                        ),
                      },
                    ]
                  : []),
                ...(query.prepTimeMinutesMax && query.prepTimeMinutesMax > 0
                  ? [
                      {
                        prepTimeMinutes: LessThanEqual(
                          query.prepTimeMinutesMax + 0.0001
                        ),
                      },
                    ]
                  : []),
                ...(query.servingsMax && query.servingsMax > 0
                  ? [
                      {
                        servings: LessThanEqual(query.servingsMax + 0.0001),
                      },
                    ]
                  : []),
                ...(query.servingsMin && query.servingsMin > 0
                  ? [
                      {
                        servings: GreaterThanEqual(query.servingsMin - 0.0001),
                      },
                    ]
                  : [])
              )
          )
          .exec()
          .then((res) =>
            res.data.payload.map((item) => ({
              ...item,
              id: item._additional!.id,
            }))
          )
      : []

  const {
    data: {
      payload: { content: answer },
    },
  } = await u.generate.json(
    [
      {
        role: 'system',
        content: `You're an assistant on our recipe book website. Answer the user's query based on the user's intent and the recipes we have found based on the user query.`,
      },
      ...history.flatMap((item) => [
        {
          role: 'user' as 'user',
          content: item.query.query,
        },
        {
          role: 'system' as 'system',
          content: `Here are the recipes we've found: ${JSON.stringify(item.recipes || [])}`,
        },
        {
          role: 'assistant' as 'assistant',
          content: item.answer,
        },
      ]),
      {
        role: 'system',
        content: `Here are the recipes we've found: ${JSON.stringify(results)}`,
      },
      {
        role: 'user',
        content: query.query,
      },
    ],
    {
      model: 'gpt-4o',
      schema: z.object({
        answer: z.string().describe("An elaborate answer to the user's query."),
        relevantRecipes: z.array(
          z
            .object({
              id: z.string().describe('The unique identifier of the recipe.'),
            })
            .describe("The recipes that are relevant to the user's query.")
        ),
      }),
    }
  )

  const allRecipes = [...results, ...history.flatMap((item) => item.recipes)]

  console.log(JSON.stringify(allRecipes))
  console.log(JSON.stringify(answer.relevantRecipes))

  return res.status(200).json({
    answer: marked.parse(answer.answer),
    query,
    recipes: allRecipes.filter((r) =>
      answer.relevantRecipes.some((relevant) => relevant.id === r.id)
    ),
  } as any)
}
