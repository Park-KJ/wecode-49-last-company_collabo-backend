import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { IFeedService } from '../feed.service.interface';
import {
  FEED_LIKE_REPOSITORY,
  FEED_REPOSITORY,
  USER_REPOSITORY,
} from 'src/infra/data/interactor/repository/ioc';
import { IFeedRepository } from 'src/domain/interactor/data/repository/feed.repository.interface';
import { IFeedLikeRepository } from 'src/domain/interactor/data/repository/feed_like.repository.interface';
import { IUserRepository } from 'src/domain/interactor/data/repository/user.repository.interface';
import { FeedLikeVo } from 'src/infra/data/typeorm/vo/feed_like.vo';
import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';
import { FeedVideoVo } from 'src/infra/data/typeorm/vo/feed_video.vo';
import { FeedImageVo } from 'src/infra/data/typeorm/vo/feed_image.vo';
import { FeedLikeDto, FeedsListDto, FeedCreateDto } from '../../dto/feed.dto';

@Injectable()
export class FeedServiceImpl implements IFeedService {
  constructor(
    @Inject(FEED_REPOSITORY) private readonly feedRepository: IFeedRepository,
    @Inject(FEED_LIKE_REPOSITORY)
    private readonly feedLikeRepository: IFeedLikeRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async getAll() {
    const feeds = await this.feedRepository.findAll();
    const feedsList: FeedsListDto = feeds.map((feed) => {
      return {
        ...feed,
        likesCount: feed.likes.length,
        commentsCount: feed.comments.length,
      };
    });
    return feedsList;
  }

  async likeFeed(feedLikeDto: FeedLikeDto): Promise<void> {
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
    return await this.feedLikeRepository.createLike(newFeedLike);
  }
  
  async createFeed(feedCreateDto: FeedCreateDto) {
    const feed = new FeedVo();
    if (feedCreateDto.content) feed.content = feedCreateDto.content;
    const user = await this.userRepository.findOneById(feedCreateDto.userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    feed.author = user;
    if (feedCreateDto.images) {
      const images = feedCreateDto.images.map((item) => {
        const imageVo = new FeedImageVo();
        imageVo.imageUrl = item;
        return imageVo;
      });
      feed.images = images;
    }
    if (feedCreateDto.video) {
      const video = new FeedVideoVo();
      video.videoUrl = feedCreateDto.video;
      feed.video = video;
    }
    return await this.feedRepository.create(feed);
  }
}
