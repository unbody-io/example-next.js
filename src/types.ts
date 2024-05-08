import {
  GetQueryDocumentPayload,
  GetQueryResult,
  IDiscordMessage,
  IGithubComment,
  IGithubThread,
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
export type GithubCommentSearchItem = Pick<
  GetQueryResult<IGithubComment>['payload'][number],
  'type' | 'html' | 'author' | 'thread'
>

export type GithubThreadSearchItem = Pick<
  GetQueryResult<IGithubThread>['payload'][number],
  'title' | 'text' | 'author' | 'type' | 'number' | 'url'
>
