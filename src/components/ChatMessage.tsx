import { Avatar } from '@heroui/react'
import clsx from 'clsx'
import React from 'react'
import { useAnimatedText } from './AnimatedText'

export type ChatMessageProps = Omit<React.HTMLProps<HTMLDivElement>, 'role'> & {
  message: string
  role: 'user' | 'assistant'
  disableAnimation?: boolean
  parsing?: boolean
  parserInfo?: string
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  parsing,
  parserInfo,
  message,
  role,
  disableAnimation = false,
  ...props
}) => {
  const content = useAnimatedText(message, {
    maxTime: 1000,
    disabled: role === 'user' || disableAnimation,
  })

  return (
    <div {...props} className={clsx('', props.className)}>
      <div className="flex flex-row gap-4 items-start">
        <Avatar
          className="flex-shrink-0"
          showFallback
          color={role === 'assistant' ? 'primary' : 'default'}
          name={role === 'assistant' ? 'A' : ''}
          classNames={{
            name: 'text-[16px]',
          }}
        />
        <div className="flex-grow border border-gray-200 rounded-lg p-4 text-md bg-white shadow-sm mt-[-4px]">
          <section
            className="markdown"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
      {role === 'user' && parserInfo && (
        <div className="mt-4 rounded-lg">{parserInfo}</div>
      )}
    </div>
  )
}
