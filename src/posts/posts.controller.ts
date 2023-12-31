import { SkipThrottle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  UseGuards,
  Req
} from '@nestjs/common'
import { Request } from 'express'
import { PostsRepository } from './posts.repository'
import { Post as PostSchema } from './posts.schema'
import { CreatePostByBlogIdDto, CreatePostDto } from '../dtos/posts/create-post.dto'
import { ResponseBody, RequestParams } from '../types/request'
import { BlogsRepository } from '../blogs/blogs.repository'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersRepository } from '../users/users.repository'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { JWTService } from '../jwt/jwt.service'
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { LikesRepository } from '../likes/likes.repository'
import { LikeDto } from '../dtos/like/like.dto'
import { IPost } from '../types/posts'
import { RoutesEnum } from '../constants/global'
import { CommentDto } from '../dtos/comments/create-comment.dto'
import { CommentsRepository } from '../comments/comments.repository'
import { LikeStatusEnum } from '../constants/likes'
import { IComment } from '../types/comments'

@SkipThrottle()
@Controller(RoutesEnum.posts)
export class PostsController {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private JWTService: JWTService,
    private likesRepository: LikesRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: RequestParams,
    @Req() req: Request,
  ): Promise<ResponseBody<IPost> | []> {
    let currentUserId: string | null = null

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId || null
    }

    const posts = await this.postsRepository.getAll(query, currentUserId)

    return posts
  }

  @Get(':id/comments')
  async getCommentsByPostId(
    @Param() params: { id: string },
    @Query() query: RequestParams,
    @Req() req: Request,
  ): Promise<ResponseBody<IComment> | []> {
    const postId = params.id

    if (!postId) {
      throw new HttpException(
        { message: appMessages(appMessages().postId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    let currentUserId: string | null = null

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId || null
    }

    const comments = await this.commentsRepository.getAll(query, postId, currentUserId)

    return comments
  }

  @Get(':id')
  async getPostById(
    @Param() params: { id: string },
    @Req() req: Request,
  ): Promise<IPost | null> {
    let currentUserId: string | undefined

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId
    }

    const post = await this.postsRepository.getById(params.id, currentUserId)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    return post
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatPost(@Body() data: CreatePostByBlogIdDto): Promise<any> {
    if (!data.blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.BAD_REQUEST
      )
    }

    const blog = await this.blogsRepository.getById(data.blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const creatingData = {
      ...data,
      blogId: blog.id,
      blogName: blog.name
    }

    return this.postsRepository.createPost(creatingData)
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: { id: string },
    @Body() data: UpdatePostDto
  ): Promise<undefined> {
    if (!params.id) {
      throw new HttpException(
        { message: appMessages(appMessages().postId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedPost = await this.postsRepository.updatePost(params.id, data)

    if (!updatedPost) {
      throw new HttpException({ message: appMessages(appMessages().post).errors.notFound }, HttpStatus.NOT_FOUND)
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() params: { id: string }): Promise<any> {
    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException({ message: appMessages(appMessages().post).errors.notFound }, HttpStatus.NOT_FOUND)
    }

    await this.postsRepository.deletePost(params.id)
  }

  @Get(':id/posts')
  async getPostsByPostId(
    @Param() params: { id: string }
  ): Promise<PostSchema | null> {
    const post = await this.postsRepository.getById(params.id)

    return null
  }

  @Post()
  async creatPostByPostId(@Body() data: CreatePostDto): Promise<any> {
    return this.postsRepository.createPost(data)
  }

  @Put('/:postId/like-status')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePostById(
    @Param() params: { postId: string },
    @CurrentUserId() currentUserId: string,
    @Body() data: LikeDto
  ): Promise<undefined> {
    const existedUser = await this.usersRepository.getById(currentUserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages('User').errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedPost = await this.postsRepository.getById(params.postId)

    if (!existedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const like = await this.likesRepository.likeEntity(
      data.likeStatus,
      params.postId,
      existedUser?.id,
      existedUser?.login
    )

    if (!like) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Post('/:postId/comments')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPost(
    @Param() params: { postId: string },
    @CurrentUserId() currentUseruserId: string,
    @Body() data: CommentDto
  ): Promise<IComment> {
    const existedUser = await this.usersRepository.getById(currentUseruserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedPost = await this.postsRepository.getById(params.postId)

    if (!existedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const comment = await this.commentsRepository.createComment({
      content: data.content,
      authorInfo: {
        userId: existedUser.id,
        userLogin: existedUser.login
      },
      sourceId: existedPost.id
    })

    if (!comment) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.authorInfo.userId,
        userLogin: comment.authorInfo.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.none
      }
    }
  }
}
