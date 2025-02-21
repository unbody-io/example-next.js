import { ChatMessages } from '@/components/ChatMessages'
import { MessageBar } from '@/components/MessageBar'
import { useState } from 'react'
import type {
  RequestParams as ChatParams,
  Data as ChatResult,
} from './api/recipes/chat'
import type {
  RequestParams as ParseQueryParams,
  Data as ParsedQuery,
} from './api/recipes/parse'

type ApiChatMessage = {
  role: 'user' | 'assistant'
  message: string
  parsing?: boolean
  parserInfo?: string
  queryIndex: number
}

const useChat = () => {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ApiChatMessage[]>([])
  const [generating, setGenerating] = useState(false)

  const [parsedQueries, setParsedQueries] = useState<ParsedQuery[]>([])
  const [chatResults, setChatResults] = useState<ChatResult[]>([])

  const onPrompt = async (prompt: string) => {
    setGenerating(true)

    setMessages((value) => [
      ...value,
      {
        role: 'user',
        message: prompt,
        queryIndex: parsedQueries.length,
      },
    ])

    let parsed: ParsedQuery

    const res = await fetch('/api/recipes/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: prompt,
        history: parsedQueries,
      } as ParseQueryParams),
    })

    if (res.ok) {
      const data = await res.json()
      parsed = data
      setParsedQueries((val) => [...val, data])
    }

    const chatRes = await fetch('/api/recipes/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: parsed!,
        history: chatResults,
      } as ChatParams),
    })

    if (chatRes.ok) {
      const data = (await chatRes.json()) as ChatResult
      setChatResults((val) => [...val, data])
      setMessages((value) => [
        ...value,
        {
          message: data.answer,
          role: 'assistant',
          queryIndex: parsedQueries.length,
        },
      ])
    }

    setGenerating(false)
    setPrompt('')
  }

  return {
    prompt,
    messages: messages.map(({ queryIndex: index, ...msg }) => ({
      ...msg,
      parsing: parsedQueries[index] || true,
      parserInfo: parsedQueries[index]
        ? generating && index === messages.length - 1
          ? `Looking up recipes... ${parsedQueries[index].queryTitle}`
          : `${parsedQueries[index].queryTitle}`
        : 'Understanding your query...',
    })),
    generating,
    setPrompt,
    onPrompt,
    parsedQueries,
  }
}

const Recipes = () => {
  const { generating, messages, onPrompt, prompt, setPrompt } = useChat()

  return (
    <div className={'h-screen overflow-hidden'}>
      <div className={'h-full container mx-auto flex flex-col'}>
        <div className="flex-grow flex-shrink-0 pt-[40px] overflow-hidden flex flex-col">
          <div className="mt-1"></div>
          <div className="overflow-auto overflow-x-hidden flex-grow h-0 pe-2">
            <ChatMessages className="py-[20px]" data={messages as any} />
          </div>
        </div>
        <MessageBar
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={(prompt) => onPrompt(prompt)}
          loading={generating}
          disabled={generating}
        />
      </div>
    </div>
  )
}

export default Recipes
