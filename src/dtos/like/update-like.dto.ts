import {
  IsEnum
} from 'class-validator'
import { LikeStatusEnum } from '../../constants/likes'
import { appMessages } from '../../constants/messages'

export class UpdateLikeDto {
  @IsEnum(LikeStatusEnum, {
    message: appMessages().errors.incorrectLikeStatus
  })
  likeStatus: LikeStatusEnum
}
