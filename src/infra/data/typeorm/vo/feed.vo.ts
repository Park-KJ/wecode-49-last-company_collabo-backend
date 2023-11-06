import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserVo } from './user.vo';
import { FeedImageVo } from './feed_image.vo';
import { FeedVideoVo } from './feed_video.vo';
import { FeedCommentVo } from './feed_comment.vo';
import { FeedLikeVo } from './feed_like.vo';

@Entity({
  name: 'feed',
})
export class FeedVo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 1000,
    default: '',
  })
  content: string;

  @ManyToOne(() => UserVo)
  @JoinColumn()
  author: UserVo;

  @OneToMany(() => FeedImageVo, (feedImage) => feedImage.feed)
  images: FeedImageVo[];

  @OneToMany(() => FeedCommentVo, (feedComment) => feedComment.commentedFeed)
  comments: FeedCommentVo[];

  @OneToMany(() => FeedLikeVo, (feedLike) => feedLike.likedFeed)
  likes: FeedLikeVo[];

  @OneToOne(() => FeedVideoVo)
  @JoinColumn()
  video: FeedVideoVo;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
