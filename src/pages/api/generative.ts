import { EProviders } from '@/configs'
import { unbody } from '@/unbody'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = string

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { prompt, context, provider, instructedPromptEnabled, sensitivity } =
    req.body

  const enhancedPrompt = [
    `You are given a set of documents about: "${context}".`,
    instructedPromptEnabled
      ? `you need to respond to user's prompt only using the information in the documents.`
      : '',
    `The user's prompt is:\n${prompt}\n`,
    `exclude the input prompt from the response.`,
    `be aware user's prompt may contain irrelevant information. or given information might be irrelevant to the topic.`,
    `format the answer in a human readable narrative in simple html format.`,
    `wrap the answer in <p> tags.`,
    `wrap code snippets in <pre> tags. use <code> tags for inline code snippets.`,
  ].join('. ')

  switch (provider) {
    case EProviders.GoogleDoc: {
      const {
        data: { generate, payload },
      } = await unbody.get.googleDoc
        .select('title')
        .search.about(context, { certainty: sensitivity })
        .limit(3)
        .generate.fromMany(enhancedPrompt, ['title', 'text'])
        .exec()

      if (payload.length === 0) {
        return res
          .status(200)
          .json(
            `It seems like I couldn't find any relevant information to generate a response. Please try again with a different context.`
          )
      }

      return res.status(200).json(generate.result)
    }
    case EProviders.DiscordMassage: {
      const {
        data: { generate, payload },
      } = await unbody.get.discordMessage
        .select('content')
        .search.about(context, { certainty: sensitivity })
        .limit(20)
        .generate.fromMany(enhancedPrompt, ['content'])
        .exec()

      if (payload.length === 0) {
        return res
          .status(200)
          .json(
            `It seems like I couldn't find any relevant information to generate a response. Please try again with a different context.`
          )
      }

      return res.status(200).json(generate.result)
    }
    case EProviders.TextBlock: {
      const {
        data: { generate, payload },
      } = await unbody.get.textBlock
        .select('text')
        .search.about(context, { certainty: sensitivity })
        .limit(20)
        .generate.fromMany(enhancedPrompt, ['text'])
        .exec()

      if (payload.length === 0) {
        return res
          .status(200)
          .json(
            `It seems like I couldn't find any relevant information to generate a response. Please try again with a different context.`
          )
      }

      return res.status(200).json(generate.result)
    }

    case EProviders.GithubComment: {
      const {
        data: { generate, payload },
      } = await unbody.get.githubComment
        .select('text')
        .search.about(context, { certainty: sensitivity })
        .limit(10)
        .generate.fromMany(enhancedPrompt, ['text'])
        .exec()

      if (payload.length === 0) {
        return res
          .status(200)
          .json(
            `It seems like I couldn't find any relevant information to generate a response. Please try again with a different context.`
          )
      }

      return res.status(200).json(generate.result)
    }

    case EProviders.GithubThread: {
      const {
        data: { generate, payload },
      } = await unbody.get.githubThread
        .select('text')
        .search.about(context, { certainty: sensitivity })
        .limit(10)
        .generate.fromMany(enhancedPrompt, ['text'])
        .exec()

      if (payload.length === 0) {
        return res
          .status(200)
          .json(
            `It seems like I couldn't find any relevant information to generate a response. Please try again with a different context.`
          )
      }

      return res.status(200).json(generate.result)
    }

    default: {
      return res.status(400).send('Invalid provider')
    }
  }
}
