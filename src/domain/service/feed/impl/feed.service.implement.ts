import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { IFeedService } from '../feed.service.interface';
import {
  FEED_COMMENT_REPOSITORY,
  FEED_LIKE_REPOSITORY,
  FEED_REPOSITORY,
  FEED_VIDEO_REPOSITORY,
  TAG_REPOSITORY,
  USER_CONNECTION_REPOSITORY,
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
  FeedCreateDto,
  FeedCommentDto,
  FeedQueryDto,
  FeedCommentDeleteDto,
  FeedDeleteDto,
  FeedsDto,
  FeedWithRelationsAndCount,
} from '../../dto/feed.dto';
import { ITagRepository } from 'src/domain/interactor/data/repository/tag.repository.interface';
import { IUserConnectionRepository } from 'src/domain/interactor/data/repository/user_connection.repository.interface';

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
    @Inject(USER_CONNECTION_REPOSITORY)
    private readonly userConnectionRepository: IUserConnectionRepository,
  ) {}

  async getList(queryDto: FeedQueryDto) {
    const { sort } = queryDto;
    if (sort === 'trending') {
      return this.getTrendingFeeds(queryDto);
    } else {
      return this.getFeedsWithQueryParams(queryDto);
    }
  }

  private async getTrendingFeeds(queryDto: FeedQueryDto) {
    // trending의 정의
    // 연결된 유저들의 최근 게시글 중
    // connected user가 좋아요를 많이 누른 게시글을 우선 보여줌

    const { userId, limit } = queryDto;
    // 연결된 유저의 목록
    let connectedUserIds: number[] = [];
    if (userId) {
      const connections = await this.userConnectionRepository.findConnections(
        userId!,
      );
      connectedUserIds = connections.map((item) =>
        item.user.id === userId ? item.connectedUser.id : item.user.id,
      );
    }

    // 1. 연결된 유저의 피드
    let feeds: FeedVo[] = [];
    if (connectedUserIds.length > 0) {
      feeds = await this.feedRepository.findConnectedUserRecentFeeds(
        connectedUserIds,
        limit,
      );
    }

    // feed에 loop를 줄이기 위해 object로 변경
    const feedsObject: Record<number, FeedWithRelationsAndCount> = {};
    // FeedsDto 초기값 설정
    feeds.forEach((feed) => {
      const feedId = feed.id;
      feedsObject[feedId] = feed;
      feedsObject[feedId].likes = [];
      feedsObject[feedId].comments = [];
      feedsObject[feedId].likedConnectedUsers = [];
      feedsObject[feedId].commentedConnectedUsers = [];
      feedsObject[feedId].likesCount = 0;
      feedsObject[feedId].commentsCount = 0;
      feedsObject[feedId].isLiked = false;
    });

    const feedIds = Object.keys(feedsObject);

    // 3. 연결된 유저의 좋아요 매핑
    const likes = await this.feedLikeRepository.findByFeedIds(feedIds);
    likes.forEach((like) => {
      const feedId = like.likedFeed.id;
      feedsObject[feedId].likes.push(like);
      feedsObject[feedId].likesCount! += 1;
      if (connectedUserIds.includes(like.liker.id))
        feedsObject[feedId].likedConnectedUsers?.push(like.liker.name);
      if (like.liker.id === userId) feedsObject[feedId].isLiked = true;
    });

    // 4. 연결된 유저의 댓글 매핑
    const comments = await this.feedCommentRepository.findByFeedIds(feedIds);
    comments.forEach((comment) => {
      const feedId = comment.commentedFeed.id;
      feedsObject[feedId].comments.push(comment);
      feedsObject[feedId].commentsCount! += 1;
      if (connectedUserIds.includes(comment.commenter.id))
        feedsObject[feedId].commentedConnectedUsers?.push(
          comment.commenter.name,
        );
    });

    // 5. 연결된 유저의 좋아요 수에 따라 정렬된 array로 변환
    const sortedFeeds = Object.values(feedsObject).sort(
      (a, b) => b.likedConnectedUsers!.length - a.likedConnectedUsers!.length,
    );

    return sortedFeeds;
  }

  private async getFeedsWithQueryParams(queryDto: FeedQueryDto) {
    const { userId } = queryDto;
    const data = await this.feedRepository.findAll(queryDto);
    const feeds: FeedsDto = data.map((feed: FeedWithRelationsAndCount) => {
      let isLiked = false;
      if (userId) {
        isLiked = feed.likes.some((like) => like.liker?.id === userId);
      }
      feed.isLiked = isLiked;
      feed.commentsCount = feed.comments.length;
      feed.likesCount = feed.likes.length;
      return feed;
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
