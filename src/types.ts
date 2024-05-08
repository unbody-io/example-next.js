import {
  IDiscordMessage,
  IGoogleDoc,
  ITextBlock,
} from '@unbody-io/ts-client/build/core/documents'

export type GDocSearchItem = Pick<IGoogleDoc, 'title' | 'text'>
export type DiscordSearchItem = Pick<IDiscordMessage, 'content'>
export type TextBlockSearchItem = Pick<ITextBlock, 'html'>
