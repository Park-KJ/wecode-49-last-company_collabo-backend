import { Inject, Injectable } from '@nestjs/common';

import { IFeedRepository } from 'src/domain/interactor/data/repository/feed.repository.interface';
import { FEED_TYPEORM_REPOSITORY } from 'src/infra/data/typeorm/repository/ioc';
import { FeedVo } from '../../../typeorm/vo/feed.vo';
import { FeedQueryDto } from 'src/domain/service/dto/feed.dto';
import { IFeedTypeormRepository } from 'src/infra/data/interactor/repository/feed/orm_interface/feed.typeorm.repository.interface';

@Injectable()
export class FeedRepositoryImpl implements IFeedRepository {
  constructor(
    @Inject(FEED_TYPEORM_REPOSITORY)
    private readonly feedTypeormRepository: IFeedTypeormRepository,
  ) {}

  async findAll(queryDto: FeedQueryDto): Promise<FeedVo[]> {
    return this.feedTypeormRepository.findWithFeedQuery(queryDto);
  }

  async findOneById(feedId: number): Promise<FeedVo | null> {
    return await this.feedTypeormRepository.findOneBy({ id: feedId });
  }

  async create(feed: FeedVo): Promise<void> {
    await this.feedTypeormRepository.save(feed);
  }

  async update(updatedFeed: FeedVo) {
    await this.feedTypeormRepository.save(updatedFeed);
  }

  async findOneWithAuthorAndTagsById(feedId: number): Promise<FeedVo | null> {
    const [feed] = await this.feedTypeormRepository.find({
      relations: {
        author: true,
        feedTags: {
          tag: true,
        },
      },
      where: { id: feedId },
    });
    return feed;
  }

  async findOneWithRelationsById(feedId: number): Promise<FeedVo | null> {
    return await this.feedTypeormRepository.findOneWithRelationsById(feedId);
  }

  async remove(feed: FeedVo) {
    await this.feedTypeormRepository.remove(feed);
  }

  async findConnectedUserRecentFeeds(
    connectedUserIds: number[],
    limit: number,
  ): Promise<FeedVo[]> {
    const feeds = await this.feedTypeormRepository
      .createQueryBuilder('feed')
      .leftJoin('feed.author', 'author')
      .addSelect(['author.id', 'author.name', 'author.profileImage'])
      .leftJoin('feed.images', 'feed_image')
      .addSelect(['feed_image.id', 'feed_image.imageUrl'])
      .leftJoin('feed.video', 'feed_video')
      .addSelect(['feed_video.id', 'feed_video.videoUrl'])
      .where('author.id IN (:connectedUserIds)', {
        connectedUserIds: connectedUserIds,
      })
      .orderBy('feed.createdAt', 'DESC')
      .limit(limit)
      .getMany();
    return feeds;
  }
}
