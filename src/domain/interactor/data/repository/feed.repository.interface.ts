import { FeedQueryDto } from 'src/domain/service/dto/feed.dto';
import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';

export interface IFeedRepository {
  findAll(queryDto: FeedQueryDto): Promise<FeedVo[]>;
  findOneById(feedId: number): Promise<FeedVo | null>;
  findOneWithAuthorAndTagsById(feedId: number): Promise<FeedVo | null>;
  create(feed: FeedVo): Promise<void>;
  update(updatedFeed: FeedVo): Promise<void>;
  findOneWithRelationsById(feedId: number): Promise<FeedVo | null>;
  remove(feed: FeedVo): Promise<void>;
  findConnectedUserRecentFeeds(
    connectedUserIds: number[],
    limit: number,
  ): Promise<FeedVo[]>;
}
