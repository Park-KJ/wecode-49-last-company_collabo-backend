import { FeedLikeVo } from 'src/infra/data/typeorm/vo/feed_like.vo';

export interface IFeedLikeRepository {
  create(feedLikeVo: FeedLikeVo): Promise<void>;
  findOne(likerId: number, likedFeedId: number): Promise<FeedLikeVo | null>;
  remove(feedLike: FeedLikeVo): Promise<void>;
  findByFeedIds(feedIds: (number | string)[]): Promise<FeedLikeVo[]>;
}
