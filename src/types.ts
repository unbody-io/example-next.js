import {
  GetQueryDocumentPayload,
  IDiscordMessage,
  IGoogleDoc,
  ITextBlock,
} from '@unbody-io/ts-client'

export type GDocSearchItem = Pick<
  GetQueryDocumentPayload<IGoogleDoc>,
  'title' | 'text'
>
export type DiscordSearchItem = Pick<
  GetQueryDocumentPayload<IDiscordMessage>,
  'content'
>
export type TextBlockSearchItem = Pick<
  GetQueryDocumentPayload<ITextBlock>,
  'html'
>
