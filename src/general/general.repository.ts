import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument } from '../blogs/blogs.schema';
import { Post, PostDocument } from '../posts/posts.schema';
import { Comment, CommentDocument } from '../comments/comments.schema';
import { User, UserDocument } from '../users/users.schema';

@Injectable()
export class GeneralRepository {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postsModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentsModel: Model<CommentDocument>,
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
  ) {}

  async clearDB() {
    await this.blogsModel.deleteMany({})
    await this.postsModel.deleteMany({})
    await this.commentsModel.deleteMany({})
    await this.usersModel.deleteMany({})

    return true
  }
}
