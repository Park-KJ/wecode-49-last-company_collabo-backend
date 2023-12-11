import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  HttpException,
  HttpStatus,
  Put,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { IFeedService } from 'src/domain/service/feed/feed.service.interface';
import { FEED_SERVICE } from 'src/domain/service/ioc';
import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';
import {
  FeedLikeDto,
  FeedsDto,
  FeedCreateDto,
  FeedCommentDto,
  FeedQueryDto,
  FeedDeleteDto,
  SortParam,
} from 'src/domain/service/dto/feed.dto';
import { AuthGuard } from 'src/domain/interactor/guard/auth.guard';
import { AuthUser } from 'src/domain/interactor/decorator/auth.decorator';

@Controller('/feed')
@UseGuards(AuthGuard)
export class FeedController {
  constructor(
    @Inject(FEED_SERVICE) private readonly feedService: IFeedService,
  ) {}

  @Get('/:feedId')
  async getOne(@Param('feedId') feedId: number): Promise<FeedVo> {
    return await this.feedService.getOne(feedId);
  }

  @Get()
  async getList(
    @AuthUser() userId: number,
    @Query('sort') sort: SortParam,
    @Query('search') search: string,
    @Query('tag') tag: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ): Promise<FeedsDto> {
    const queryDto: FeedQueryDto = {
      sort: sort || 'recent',
      search: search,
      tag: tag,
      offset: Number(offset) || 0,
      limit: Number(limit) || 10,
      userId: userId,
    };
    return await this.feedService.getList(queryDto);
  }

  @Post('/:feedId/comment')
  async createComment(
    @AuthUser() userId: number,
    @Body() body: any,
    @Param('feedId') feedId: number,
  ): Promise<void> {
    const feedCommentDto: FeedCommentDto = {
      userId: userId,
      feedId: Number(feedId),
      content: body.content,
    };
    return await this.feedService.createComment(feedCommentDto);
  }

  @Post('/:feedId/like')
  async createLike(
    @AuthUser() userId: number,
    @Param('feedId') feedId: string,
  ): Promise<void> {
    const feedLikeDto: FeedLikeDto = {
      likerId: userId,
      likedFeedId: parseInt(feedId),
    };
    return await this.feedService.createLike(feedLikeDto);
  }

  @Post()
  async createFeed(
    @AuthUser() userId: number,
    @Body() body: Partial<FeedCreateDto>,
  ): Promise<void> {
    if (!body.content && !body.images && !body.video)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const feedCreateDto: FeedCreateDto = {
      userId: userId,
      content: body.content,
      images: body.images,
      video: body.video,
    };
    return await this.feedService.createFeed(feedCreateDto);
  }

  @Put('/:feedId')
  async updateFeed(
    @AuthUser() userId: number,
    @Param('feedId') feedId: number,
    @Body() body: FeedCreateDto,
  ) {
    const feedUpdateDto: FeedCreateDto = {
      ...body,
      userId: userId,
    };
    return await this.feedService.updateFeed(Number(feedId), feedUpdateDto);
  }

  @Delete('/:feedId/comment/:commentId')
  async deleteComment(
    @AuthUser() userId: number,
    @Param('feedId') feedId: number,
    @Param('commentId') commentId: number,
  ): Promise<void> {
    const feedCommentDeleteDto = {
      userId: userId,
      feedId: Number(feedId),
      commentId: Number(commentId),
    };
    return await this.feedService.deleteComment(feedCommentDeleteDto);
  }

  @Put('/:feedId/comment/:commentId')
  async updateComment(
    @AuthUser() userId: number,
    @Param('feedId') feedId: number,
    @Param('commentId') commentId: number,
    @Body() body: Partial<FeedCommentDto>,
  ): Promise<void> {
    if (!body.content)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const feedCommentDto: FeedCommentDto = {
      userId: userId,
      feedId: feedId,
      content: body.content,
    };
    return await this.feedService.updateComment(
      Number(commentId),
      feedCommentDto,
    );
  }

  @Delete('/:feedId/like')
  async deleteLike(
    @AuthUser() userId: number,
    @Param('feedId') feedId: number,
  ) {
    const feedLikeDto: FeedLikeDto = {
      likerId: userId,
      likedFeedId: Number(feedId),
    };
    return await this.feedService.deleteLike(feedLikeDto);
  }

  @Delete('/:feedId')
  async deleteFeed(
    @AuthUser() userId: number,
    @Param('feedId') feedId: number,
  ) {
    const feedDeleteDto: FeedDeleteDto = {
      userId: Number(userId),
      feedId: feedId,
    };
    return await this.feedService.deleteFeed(feedDeleteDto);
  }
}
