import {
  AutoSummary,
  CustomSchema,
  Enhancement,
  Generative,
  ProjectSettings,
  Reranker,
  TextVectorizer,
  UnbodyAdmin,
} from 'unbody/admin'

const settings = new ProjectSettings()

settings
  .set(new TextVectorizer(TextVectorizer.OpenAI.TextEmbedding3Small))
  .set(new Generative(Generative.OpenAI.GPT4o))
  .set(new Reranker(Reranker.Cohere.EnglishV3))
  .set(new AutoSummary(AutoSummary.OpenAI.GPT4oMini))

const recipeCollection = new CustomSchema.Collection('RecipeCollection').add(
  new CustomSchema.Field.Text('title', '', false),
  new CustomSchema.Field.Text('meta', '', true, 'word', true),
  new CustomSchema.Field.Text('text', ''),
  new CustomSchema.Field.Text('ingredients', '', true, 'word', true),
  new CustomSchema.Field.Text('mealTypes', '', true, 'field'),
  new CustomSchema.Field.Text('courseTypes', '', true, 'field'),
  new CustomSchema.Field.Text('cuisineTypes', '', true, 'field'),
  new CustomSchema.Field.Text('seasons', '', true, 'field'),
  new CustomSchema.Field.Text('allergens', '', true, 'word'),
  new CustomSchema.Field.Number('prepTimeMinutes', ''),
  new CustomSchema.Field.Number('cookTimeMinutes', ''),
  new CustomSchema.Field.Number('totalTimeMinutes', ''),
  new CustomSchema.Field.Number('servings', '')
)

settings.set(new CustomSchema().add(recipeCollection))

const enhancementPipeline = new Enhancement.Pipeline(
  'enrich_recipe',
  'RecipeCollection'
).add(
  new Enhancement.Step(
    'extract',
    new Enhancement.Action.StructuredGenerator({
      model: 'openai-gpt-4o',
      prompt: (ctx) => `Extract structured data from the recipe: 
      
      ${ctx.record.text}

      ${(ctx.record.meta || []).join('\t')}
      
      `,
      schema: (ctx, { z }) =>
        z.object({
          ingredients: z
            .array(z.string())
            .describe(
              "List of ingredients without quantities or descriptions e.g., 'flour', 'sugar', 'salt'"
            )
            .nullable()
            .default([]),
          mealTypes: z
            .array(z.string())
            .nullable()
            .default([])
            .describe('List of meal types e.g., "breakfast", "lunch"'),
          courseTypes: z
            .array(z.string())
            .nullable()
            .default([])
            .describe(
              'List of course types e.g., "appetizer", "main", "salad"'
            ),
          cuisineTypes: z
            .array(z.string())
            .nullable()
            .default([])
            .describe('List of cuisine types e.g., "italian", "mexican"'),
          seasons: z
            .array(z.string())
            .nullable()
            .default([])
            .describe(
              'List of seasons in which the recipe is typically made e.g., "summer"'
            ),
          allergens: z
            .array(z.string())
            .describe(
              'List of allergens present in the recipe e.g., "peanuts", "dairy"'
            )
            .default([]),
          prepTimeMinutes: z
            .number()
            .describe('Preparation time in minutes')
            .default(-1)
            .nullable(),
          cookTimeMinutes: z
            .number()
            .describe('Cooking time in minutes')
            .default(-1)
            .nullable(),
          servings: z
            .number()
            .describe('Number of servings')
            .default(-1)
            .nullable(),
        }),
    }),
    {
      output: {
        ingredients: (ctx) => ctx.result.json.ingredients || [],
        mealTypes: (ctx) => ctx.result.json.mealTypes || [],
        courseTypes: (ctx) => ctx.result.json.courseTypes || [],
        cuisineTypes: (ctx) => ctx.result.json.cuisineTypes || [],
        seasons: (ctx) => ctx.result.json.seasons || [],
        allergens: (ctx) => ctx.result.json.allergens || [],
        prepTimeMinutes: (ctx) => ctx.result.json.prepTimeMinutes || -1,
        cookTimeMinutes: (ctx) => ctx.result.json.cookTimeMinutes || -1,
        servings: (ctx) => ctx.result.json.servings || -1,
        totalTimeMinutes: (ctx) =>
          (ctx.result.json.prepTimeMinutes || -1) +
          (ctx.result.json.cookTimeMinutes || -1),
      },
    }
  )
)

settings.set(new Enhancement().add(enhancementPipeline))

export const run = async () => {
  const admin = new UnbodyAdmin({
    auth: {
      username: process.env.UNBODY_ADMIN_ID,
      password: process.env.UNBODY_ADMIN_SECRET,
    },
  })

  const project = await admin.projects
    .ref({ name: 'Recipe Project', settings })
    .save()
  const { key } = await project.apiKeys.ref({ name: 'development' }).save()

  const source = await project.sources
    .ref({ name: 'Recipes', type: 'push_api' })
    .save()

  console.log(
    `UNBODY_PROJECT_ID=${project.id}\nUNBODY_API_KEY=${key}\nUNBODY_SOURCE_ID=${source.id}`
  )
}
