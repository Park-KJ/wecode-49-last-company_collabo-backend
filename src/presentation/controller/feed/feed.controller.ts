import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Headers,
  HttpException,
  HttpStatus,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JwtService } from '@nestjs/jwt';

import { IFeedService } from 'src/domain/service/feed/feed.service.interface';
import { FEED_SERVICE } from 'src/domain/service/ioc';
import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';
import {
  FeedLikeDto,
  FeedCreateDto,
  FeedCommentDto,
  FeedQueryDto,
  FeedDeleteDto,
  SortParam,
  FeedsDto,
} from 'src/domain/service/dto/feed.dto';

@Controller('/feed')
export class FeedController {
  constructor(
    @Inject(FEED_SERVICE) private readonly feedService: IFeedService,
    private readonly JwtService: JwtService,
  ) {}

  @Get('/:feedId')
  async getOne(@Param('feedId') feedId: number): Promise<FeedVo> {
    return await this.feedService.getOne(feedId);
  }

  @Get()
  async getList(
    @Query('sort') sort: SortParam,
    @Query('search') search: string,
    @Query('tag') tag: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Headers('authorization') token: string,
  ): Promise<FeedsDto> {
    const queryDto: FeedQueryDto = {
      sort: sort || 'recent',
      search: search,
      tag: tag,
      offset: Number(offset) || 0,
      limit: Number(limit) || 10,
    };
    if (token) queryDto.userId = this.verifyToken(token).aud;
    return await this.feedService.getList(queryDto);
  }

  @Post('/:feedId/comment')
  async createComment(
    @Body() body: any,
    @Param('feedId') feedId: number,
    @Headers('authorization') token: string,
  ): Promise<void> {
    const decoded = this.verifyToken(token);
    const feedCommentDto: FeedCommentDto = {
      userId: decoded.aud,
      feedId: Number(feedId),
      content: body.content,
    };
    return await this.feedService.createComment(feedCommentDto);
  }

  @Post('/:feedId/like')
  async createLike(
    @Param('feedId') feedId: string,
    @Headers('authorization') token: string,
  ): Promise<void> {
    const decodedToken = this.verifyToken(token);
    const feedLikeDto: FeedLikeDto = {
      likerId: decodedToken.aud,
      likedFeedId: parseInt(feedId),
    };
    return await this.feedService.createLike(feedLikeDto);
  }

  @Post()
  async createFeed(
    @Body() body: Partial<FeedCreateDto>,
    @Headers('authorization') token: string,
  ): Promise<void> {
    if (!body.content && !body.images && !body.video)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const decodedToken = this.verifyToken(token);
    const feedCreateDto: FeedCreateDto = {
      userId: decodedToken.aud,
      content: body.content,
      images: body.images,
      video: body.video,
    };
    return await this.feedService.createFeed(feedCreateDto);
  }

  @Put('/:feedId')
  async updateFeed(
    @Headers('authorization') token: string,
    @Param('feedId') feedId: number,
    @Body() body: Partial<FeedCreateDto>,
  ) {
    const decoded = this.verifyToken(token);
    const feedUpdateDto: FeedCreateDto = {
      ...body,
      userId: decoded.aud,
    };
    return await this.feedService.updateFeed(Number(feedId), feedUpdateDto);
  }

  @Delete('/:feedId/comment/:commentId')
  async deleteComment(
    @Headers('authorization') token: string,
    @Param('feedId') feedId: number,
    @Param('commentId') commentId: number,
  ): Promise<void> {
    const decoded = this.verifyToken(token);
    const feedCommentDeleteDto = {
      userId: decoded.aud,
      feedId: Number(feedId),
      commentId: Number(commentId),
    };
    return await this.feedService.deleteComment(feedCommentDeleteDto);
  }

  @Put('/:feedId/comment/:commentId')
  async updateComment(
    @Headers('authorization') token: string,
    @Param('feedId') feedId: number,
    @Param('commentId') commentId: number,
    @Body() body: Partial<FeedCommentDto>,
  ): Promise<void> {
    const decoded = this.verifyToken(token);
    if (!body.content)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const feedCommentDto: FeedCommentDto = {
      userId: decoded.aud,
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
    @Headers('authorization') token: string,
    @Param('feedId') feedId: number,
  ) {
    const decoded = this.verifyToken(token);
    const feedLikeDto: FeedLikeDto = {
      likerId: decoded.aud,
      likedFeedId: Number(feedId),
    };
    return await this.feedService.deleteLike(feedLikeDto);
  }

  @Delete('/:feedId')
  async deleteFeed(
    @Headers('authorization') token: string,
    @Param('feedId') feedId: number,
  ) {
    const decoded = this.verifyToken(token);
    const feedDeleteDto: FeedDeleteDto = {
      userId: Number(decoded.aud),
      feedId: feedId,
    };
    return await this.feedService.deleteFeed(feedDeleteDto);
  }

  verifyToken(token: string): { aud: number } {
    const decoded = this.JwtService.verify(token);
    return decoded;
  }
}
