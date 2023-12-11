import { FeedVo } from 'src/infra/data/typeorm/vo/feed.vo';

export type FeedWithRelationsAndCount = FeedVo & {
  likedConnectedUsers?: string[];
  commentedConnectedUsers?: string[];
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
};

export type FeedsDto = FeedWithRelationsAndCount[];

export type FeedLikeDto = {
  likerId: number;
  likedFeedId: number;
};

export type FeedCreateDto = {
  userId: number;
  content?: string;
  images?: string[];
  video?: string;
};

export type FeedCommentDto = {
  userId: number;
  feedId: number;
  content: string;
};

export type FeedQueryDto = {
  sort: SortParam;
  search: string;
  tag: string;
  limit: number;
  offset: number;
  userId?: number;
};

export type SortParam = 'recent' | 'trending';

export type FeedCommentDeleteDto = {
  userId: number;
  feedId: number;
  commentId: number;
};

export type FeedDeleteDto = {
  userId: number;
  feedId: number;
};
