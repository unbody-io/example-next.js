import { Unbody } from '@unbody-io/ts-client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type Data = {
  id: string
  url: string
  distance: number

  width: number
  height: number
}

const u = new Unbody({
  apiKey: process.env.UNBODY_API_KEY!,
  projectId: process.env.UNBODY_PROJECT_ID!,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data[]>
) {
  const { query: input, provider, sensitivity } = req.body

  const results: Data[] = []

  let query = u.get.imageBlock
    .where(({ GreaterThan }) => ({
      url: GreaterThan('https://'),
    }))
    .select('url', 'width', 'height')
    .additional('id')

  if (typeof input === 'string' && input.length > 0) {
    let inputType: 'url' | 'id' | null = null

    try {
      new URL(input)
      inputType = 'url'
    } catch (e) {
      inputType = 'id'
    }

    if (inputType === 'id') {
      query = query.nearObject({
        id: input,
        certainty: sensitivity,
      }) as any
    } else {
      query = query.similar.image(input, { certainty: sensitivity }) as any
    }
  }

  const {
    data: { payload },
  } = await query.exec()

  results.push(
    ...payload.map((res) => ({
      id: res._additional!.id as string,
      url: res.url as string,
      width: res.width as number,
      height: res.height as number,
      distance: res._additional!.distance as number,
    }))
  )

  return res.status(200).json(results)
}
