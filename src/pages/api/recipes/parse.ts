import type { NextApiRequest, NextApiResponse } from 'next'
import { Unbody } from 'unbody'
import { z } from 'zod'

const u = new Unbody({
  apiKey: process.env.UNBODY_API_KEY!,
  projectId: process.env.UNBODY_PROJECT_ID!,
})

export type RequestParams = {
  query: string
  history?: Data[]
}

export type Data = {
  query: string
  queryTitle: string
  concepts: string[]
  intent: 'search' | 'question'
  includeIngredients?: string[]
  excludeIngredients?: string[]
  includeMealTypes?: string[]
  excludeMealTypes?: string[]
  includeCourseTypes?: string[]
  excludeCourseTypes?: string[]
  includeCuisineTypes?: string[]
  excludeCuisineTypes?: string[]
  includeSeasons?: string[]
  excludeSeasons?: string[]
  excludeAllergens?: string[]
  prepTimeMinutesMax?: number | undefined
  cookTimeMinutesMax?: number | undefined
  totalTimeMinutesMax?: number | undefined
  servingsMin?: number | undefined
  servingsMax?: number | undefined
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { history = [] } = req.body as RequestParams
  const query = req.body.query

  const {
    data: { payload },
  } = await u.generate.json(
    [
      {
        role: 'system',
        content:
          "Analyze the user's query and history of queries to determine the user's intent and preferences.",
      },
      ...history.flatMap((item) => [
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

  return res.status(200).json({
    ...payload.content,
    query,
  } as Data)
}
