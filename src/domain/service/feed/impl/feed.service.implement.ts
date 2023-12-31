import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { IFeedService } from '../feed.service.interface';
import {
  FEED_COMMENT_REPOSITORY,
  FEED_LIKE_REPOSITORY,
  FEED_REPOSITORY,
  FEED_VIDEO_REPOSITORY,
  TAG_REPOSITORY,
  USER_REPOSITORY,
} from 'src/infra/data/interactor/repository/ioc';
import { IFeedRepository } from 'src/domain/interactor/data/repository/feed.repository.interface';
import { IUserRepository } from 'src/domain/interactor/data/repository/user.repository.interface';
import { IFeedCommentRepository } from 'src/domain/interactor/data/repository/feed_comment.repository.interface';
import { IFeedLikeRepository } from 'src/domain/interactor/data/repository/feed_like.repository.interface';
import { IFeedVideoRepository } from 'src/domain/interactor/data/repository/feed_video.repository.interface';
import { FeedCommentVo } from 'src/infra/data/typeorm/vo/feed_comment.vo';
import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';
import { FeedVideoVo } from 'src/infra/data/typeorm/vo/feed_video.vo';
import { FeedImageVo } from 'src/infra/data/typeorm/vo/feed_image.vo';
import { FeedLikeVo } from 'src/infra/data/typeorm/vo/feed_like.vo';
import { FeedTagVo } from 'src/infra/data/typeorm/vo/feed_tag.vo';
import { TagVo } from 'src/infra/data/typeorm/vo/tag.vo';
import {
  FeedLikeDto,
  FeedsDto,
  FeedCreateDto,
  FeedCommentDto,
  FeedQueryDto,
  FeedCommentDeleteDto,
  FeedDeleteDto,
} from '../../dto/feed.dto';
import { ITagRepository } from 'src/domain/interactor/data/repository/tag.repository.interface';

@Injectable()
export class FeedServiceImpl implements IFeedService {
  constructor(
    @Inject(FEED_REPOSITORY) private readonly feedRepository: IFeedRepository,
    @Inject(FEED_LIKE_REPOSITORY)
    private readonly feedLikeRepository: IFeedLikeRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(FEED_COMMENT_REPOSITORY)
    private readonly feedCommentRepository: IFeedCommentRepository,
    @Inject(FEED_VIDEO_REPOSITORY)
    private readonly feedVideoRepository: IFeedVideoRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async getList(queryDto: FeedQueryDto) {
    const data = await this.feedRepository.findAll(queryDto);
    const feeds: FeedsDto = data.map((feed) => {
      let isLiked = false;
      if (queryDto.userId) {
        isLiked = feed.likes.some((like) => like.liker?.id === queryDto.userId);
      }
      return {
        ...feed,
        likesCount: feed.likes.length,
        commentsCount: feed.comments.length,
        isLiked: isLiked,
      };
    });
    return feeds;
  }

  async createLike(feedLikeDto: FeedLikeDto): Promise<void> {
    if (
      typeof feedLikeDto.likedFeedId !== 'number' ||
      typeof feedLikeDto.likerId !== 'number'
    )
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);

    const liker = await this.userRepository.findOneById(feedLikeDto.likerId);
    const likedFeed = await this.feedRepository.findOneById(
      feedLikeDto.likedFeedId,
    );

    if (!liker || !likedFeed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const newFeedLike = new FeedLikeVo();
    newFeedLike.liker = liker;
    newFeedLike.likedFeed = likedFeed;
    return await this.feedLikeRepository.create(newFeedLike);
  }

  async createFeed(feedCreateDto: FeedCreateDto): Promise<void> {
    const { userId, content, images, video } = feedCreateDto;
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const feed = new FeedVo();
    feed.author = user;
    if (content) feed.content = content;
    if (images) feed.images = this.createImageVos(images);
    if (video) feed.video = this.createVideoVo(video);
    let tags: FeedTagVo[];
    if (content) {
      const rawTags = this.extractTags(content);
      tags = await this.createFeedTagVos(feed, rawTags);
      feed.feedTags = tags;
    }
    return await this.feedRepository.create(feed);
  }

  async createComment(feedCommentDto: FeedCommentDto): Promise<void> {
    const { userId, feedId, content } = feedCommentDto;
    const feed = await this.feedRepository.findOneById(feedId);
    if (!feed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    const commenter = await this.userRepository.findOneById(userId);
    if (!commenter)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const comment = new FeedCommentVo();
    comment.content = content;
    comment.commenter = commenter;
    comment.commentedFeed = feed;
    await this.feedCommentRepository.create(comment);
  }

  async updateFeed(
    feedId: number,
    feedUpdateDto: FeedCreateDto,
  ): Promise<void> {
    const { userId, content, images, video } = feedUpdateDto;
    const feed = await this.feedRepository.findOneWithAuthorAndTagsById(feedId);
    if (!feed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (userId !== feed.author.id)
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    if (content) feed.content = content;
    if (images) feed.images = this.createImageVos(images);
    if (video) feed.video = this.createVideoVo(video);
    if (content) {
      // 모든 태그 추출
      const rawTagsFromContent: string[] = this.extractTags(content);
      // 현재 태그 확인
      const originalFeedTagVos = feed.feedTags;
      // 업데이트된 피드에 남아있는 태그
      const remainingTagsInUpdatedFeed = originalFeedTagVos.filter(
        (feedTagVo: FeedTagVo) =>
          rawTagsFromContent.includes(feedTagVo.tag.tag),
      );
      // 피드에 있던 태그들의 string만 추출
      const originalFeedTagStrings: string[] = originalFeedTagVos.map(
        (item) => item.tag.tag,
      );
      // 업데이트되면서 피드에 추가된 태그
      const addedTags = rawTagsFromContent.filter(
        (tag) => !originalFeedTagStrings.includes(tag),
      );
      // 업데이트된 태그들
      const updatedFeedTags = await this.createFeedTagVos(
        feed,
        addedTags,
        remainingTagsInUpdatedFeed,
      );
      feed.feedTags = updatedFeedTags;
    }
    await this.feedRepository.update(feed);
  }

  async getOne(feedId: number): Promise<FeedVo> {
    const feed = await this.feedRepository.findOneWithRelationsById(feedId);
    if (!feed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    return feed;
  }

  async deleteComment(
    feedCommentDeleteDto: FeedCommentDeleteDto,
  ): Promise<void> {
    const { userId, feedId, commentId } = feedCommentDeleteDto;
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const feed = await this.feedRepository.findOneById(feedId);
    if (!feed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    const comment = await this.feedCommentRepository.findOneById(commentId);
    if (!comment)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    return await this.feedCommentRepository.remove(comment);
  }

  async updateComment(
    commentId: number,
    feedCommentDto: FeedCommentDto,
  ): Promise<void> {
    const { userId, feedId, content } = feedCommentDto;
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const feed = await this.feedRepository.findOneById(feedId);
    if (!feed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    const comment = await this.feedCommentRepository.findOneById(commentId);
    if (!comment)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    comment.content = content;
    return await this.feedCommentRepository.update(comment);
  }

  async deleteLike(feedLikeDto: FeedLikeDto): Promise<void> {
    const { likerId, likedFeedId } = feedLikeDto;
    const likedFeed = await this.feedRepository.findOneById(likedFeedId);
    if (!likedFeed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    const liker = await this.userRepository.findOneById(likerId);
    if (!liker) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const feedLike = await this.feedLikeRepository.findOne(
      likerId,
      likedFeedId,
    );
    if (!feedLike)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    await this.feedLikeRepository.remove(feedLike);
  }

  async deleteFeed(feedDeleteDto: FeedDeleteDto): Promise<void> {
    const { userId, feedId } = feedDeleteDto;
    const feed = await this.feedRepository.findOneWithRelationsById(feedId);
    if (!feed)
      throw new HttpException('CONTENT_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (feed.author.id !== userId)
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    await this.feedRepository.remove(feed);
    if (feed.video) await this.feedVideoRepository.remove(feed.video);
  }

  private createImageVos(images: string[]): FeedImageVo[] {
    return images.map((item) => {
      const imageVo = new FeedImageVo();
      imageVo.imageUrl = item;
      return imageVo;
    });
  }

  private createVideoVo(videoUrl: string): FeedVideoVo {
    const videoVo = new FeedVideoVo();
    videoVo.videoUrl = videoUrl;
    return videoVo;
  }

  private extractTags(content: string) {
    const hashtagRegex: RegExp = /#\w+/g;
    return content.match(hashtagRegex) || [];
  }

  private async createFeedTagVos(
    feed: FeedVo,
    newTags: string[],
    remainingTagsInUpdatedFeed: FeedTagVo[] = [],
  ): Promise<FeedTagVo[]> {
    const existingTagVosOnDb = await this.tagRepository.findAll(newTags);
    const existingTagStringsOnDb = existingTagVosOnDb.map((item) => item.tag);

    const newTagVos: FeedTagVo[] = [];
    newTags.forEach((item) => {
      if (!existingTagStringsOnDb.includes(item)) {
        const tagVo = new TagVo();
        tagVo.tag = item;
        const feedTagVo = new FeedTagVo();
        feedTagVo.tag = tagVo;
        feedTagVo.feed = feed;
        newTagVos.push(feedTagVo);
      }
    });
    return remainingTagsInUpdatedFeed.concat(newTagVos);
  }
}
