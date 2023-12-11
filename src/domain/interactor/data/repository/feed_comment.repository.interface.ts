import { FeedCommentVo } from 'src/infra/data/typeorm/vo/feed_comment.vo';

export interface IFeedCommentRepository {
  create(feed: FeedCommentVo): Promise<void>;
  findOneById(commentId: number): Promise<FeedCommentVo | null>;
  remove(comment: FeedCommentVo): Promise<void>;
  update(comment: FeedCommentVo): Promise<void>;
  findByFeedIds(feedIds: (number | string)[]): Promise<FeedCommentVo[]>;
}
