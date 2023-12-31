import {
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  MinLength
} from 'class-validator'
import {
  STRING_MAX_LENGTH,
} from '../../constants/global'
import {
  BLOG_DESCRIPTION_MAX_LENGTH,
  BLOG_DESCRIPTION_MIN_LENGTH,
  BLOG_NAME_MAX_LENGTH,
  BLOG_NAME_MIN_LENGTH
} from '../../constants/blogs'
import { Transform, TransformFnParams } from 'class-transformer'

export class UpdateBlogDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(BLOG_NAME_MIN_LENGTH)
  @MaxLength(BLOG_NAME_MAX_LENGTH)
  name: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(BLOG_DESCRIPTION_MIN_LENGTH)
  @MaxLength(BLOG_DESCRIPTION_MAX_LENGTH)
  description: string

  @IsString()
  @IsUrl()
  @MaxLength(STRING_MAX_LENGTH)
  websiteUrl: string
}
