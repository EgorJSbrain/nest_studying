import { ILikeInfo } from './likes'

export type CommentAuthorInfo = {
  userId: string
  userLogin: string
}

export interface IComment {
  id: string
  commentatorInfo: CommentAuthorInfo
  content: string
  createdAt: string
  likesInfo: ILikeInfo
}

export interface ICreateCommentType {
  readonly content: string
  readonly authorInfo: CommentAuthorInfo
  readonly sourceId: string
}

export interface IUpdateCommentType {
  readonly id: string
  readonly content: string
}
