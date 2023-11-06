import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FeedVo } from './feed.vo';
import { UserVo } from './user.vo';

@Entity({
  name: 'feed_like',
})
export class FeedLikeVo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FeedVo, (feed) => feed.likes)
  likedFeed: FeedVo;

  @ManyToOne(() => UserVo, (user) => user.likes)
  liker: UserVo;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
