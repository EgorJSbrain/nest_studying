import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment, CommentDocument } from './comments.schema';
import { CreateCommentDto } from 'src/dtos/comments/create-comment.dto';
import { RequestParams, ResponseBody, SortDirections } from 'src/typing/request';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private commentssModel: Model<CommentDocument>) {}

  async getAll(params: RequestParams): Promise<ResponseBody<CommentDocument> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
      } = params
  
      const sort: Record<string, SortOrder> = {}
      let filter: FilterQuery<CommentDocument> = {}
  
      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
      }
  
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await this.commentssModel.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)
  
      const comments = await this.commentssModel
        .find(filter, { _id: 0, __v: 0 })
        .skip(skip)
        .limit(pageSizeNumber)
        .sort(sort)
        .exec()
      
      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: comments
      }
    } catch {
      return []
    }
  }

  getCommentById(id: string) {
    return this.commentssModel.findById(id)
  }

  createComment(data: CreateCommentDto) {
    const newComment = new this.commentssModel(data)
    newComment.setDateOfCreatedAt()
    newComment.setId()

    return newComment.save()
  }

  deleteComment(id: string) {
    return this.commentssModel.deleteOne({ id })
  }

  save(comment: CommentDocument) {
    return comment.save()
  }
}