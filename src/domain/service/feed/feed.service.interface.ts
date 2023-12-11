import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';
import {
  FeedLikeDto,
  FeedCreateDto,
  FeedCommentDto,
  FeedQueryDto,
  FeedCommentDeleteDto,
  FeedDeleteDto,
  FeedsDto,
} from '../dto/feed.dto';

export interface IFeedService {
  getList(queryDto: FeedQueryDto): Promise<FeedsDto>;
  createComment(feedCommentDto: FeedCommentDto): Promise<void>;
  createLike(feedLikeDto: FeedLikeDto): Promise<void>;
  createFeed(feedCreateDto: FeedCreateDto): Promise<void>;
  updateFeed(feedId: number, feedUpdateDto: FeedCreateDto): Promise<void>;
  getOne(feedId: number): Promise<FeedVo>;
  deleteComment(feedCommentDeleteDto: FeedCommentDeleteDto): Promise<void>;
  updateComment(
    commentId: number,
    feedCommentDto: FeedCommentDto,
  ): Promise<void>;
  deleteLike(feedLikeDto: FeedLikeDto): Promise<void>;
  deleteFeed(feedDeleteDto: FeedDeleteDto): Promise<void>;
}
