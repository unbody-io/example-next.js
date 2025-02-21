import * as async from 'async'
import { UnbodyPushAPI } from 'unbody/push'

import { UnbodyAdmin } from 'unbody/admin'
import RECIPES from './recipes.json'

export const run = async () => {
  const push = new UnbodyPushAPI({
    auth: {
      apiKey: process.env.UNBODY_API_KEY,
    },
    projectId: process.env.UNBODY_PROJECT_ID || '',
    sourceId: process.env.UNBODY_SOURCE_ID || '',
  })

  await async.parallelLimit(
    RECIPES.map((recipe, index) => {
      return (callback) => {
        push.records
          .create({
            collection: 'RecipeCollection',
            id: `recpie_${index}`,
            payload: {
              title: recipe.title,
              meta: recipe.meta,
              text: recipe.text,
            },
          })
          .then(() => callback(null))
          .catch((e) => callback(e))
      }
    }),
    10
  )

  const admin = new UnbodyAdmin({
    auth: {
      username: process.env.UNBODY_ADMIN_ID,
      password: process.env.UNBODY_ADMIN_SECRET,
    },
  })

  const source = await admin.projects
    .ref({ id: process.env.UNBODY_PROJECT_ID })
    .sources.get({ id: process.env.UNBODY_SOURCE_ID!, type: 'push_api' })

  if (source.initialized) await source.update()
  else await source.initialize()
}
