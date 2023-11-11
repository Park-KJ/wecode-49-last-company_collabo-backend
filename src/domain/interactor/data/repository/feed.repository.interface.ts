import { FeedQueryDto } from 'src/domain/service/dto/feed.dto';
import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';
import { FindManyOptions } from 'typeorm';

export interface IFeedRepository {
  findAll(queryOptions: FindManyOptions<FeedVo>): Promise<FeedVo[]>;
  findOneById(feedId: number): Promise<FeedVo | null>;
  findOneWithAuthorAndTagsById(feedId: number): Promise<FeedVo | null>;
  create(feed: FeedVo): Promise<void>;
  update(updatedFeed: FeedVo): Promise<void>;
  findOneWithRelationsById(feedId: number): Promise<FeedVo | null>;
  queryOptionsBuilder(queryDto: FeedQueryDto): FindManyOptions<FeedVo>;
  remove(feed: FeedVo): Promise<void>;
}
