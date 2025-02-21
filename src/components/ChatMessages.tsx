import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'
import { ChatMessage, ChatMessageProps } from './ChatMessage'

export type ChatMessagesProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  'data'
> & {
  data?: Pick<
    ChatMessageProps,
    'message' | 'role' | 'disableAnimation' | 'parserInfo' | 'parsing'
  >[]
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  data = [],
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(data)

  useEffect(() => {
    if (!ref.current) return
    if (messagesRef.current.length === data.length) return

    messagesRef.current = data

    const parent = ref.current.parentElement
    setTimeout(() => {
      parent?.scrollBy({
        top: parent.scrollHeight,
        behavior: 'smooth',
      })
    }, 1000)
  }, [data])

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        'flex flex-col gap-8 w-full overflow-x-hidden',
        props.className
      )}
    >
      {data.map((message, index) => (
        <ChatMessage
          key={index}
          role={message.role}
          message={message.message}
          disableAnimation={message.disableAnimation || index < data.length - 1}
          parsing={message.parsing}
          parserInfo={message.parserInfo}
        />
      ))}
    </div>
  )
}
