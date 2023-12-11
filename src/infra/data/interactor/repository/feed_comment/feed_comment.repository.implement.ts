import { Inject, Injectable } from '@nestjs/common';
import { FEED_COMMENT_TYPEORM_REPOSITORY } from 'src/infra/data/typeorm/repository/ioc';
import { Repository } from 'typeorm';
import { IFeedCommentRepository } from 'src/domain/interactor/data/repository/feed_comment.repository.interface';
import { FeedCommentVo } from 'src/infra/data/typeorm/vo/feed_comment.vo';

@Injectable()
export class FeedCommentRepositoryImpl implements IFeedCommentRepository {
  constructor(
    @Inject(FEED_COMMENT_TYPEORM_REPOSITORY)
    private readonly feedCommentTypeormRepository: Repository<FeedCommentVo>,
  ) {}

  async create(comment: FeedCommentVo): Promise<void> {
    await this.feedCommentTypeormRepository.save(comment);
  }

  async findOneById(commentId: number): Promise<FeedCommentVo | null> {
    const [comment] = await this.feedCommentTypeormRepository.find({
      where: {
        id: commentId,
      },
    });
    return comment;
  }

  async remove(comment: FeedCommentVo): Promise<void> {
    await this.feedCommentTypeormRepository.remove(comment);
  }

  async update(updatedComment: FeedCommentVo): Promise<void> {
    await this.feedCommentTypeormRepository.save(updatedComment);
  }

  async findByFeedIds(feedIds: (string | number)[]): Promise<FeedCommentVo[]> {
    return await this.feedCommentTypeormRepository
      .createQueryBuilder('feed_comment')
      .select([
        'feed_comment.id',
        'feed_comment.content',
        'feed_comment.createdAt',
        'feed_comment.updatedAt',
      ])
      .leftJoin('feed_comment.commenter', 'commenter')
      .leftJoin('feed_comment.commentedFeed', 'commentedFeed')
      .addSelect(['commenter.id', 'commenter.name', 'commenter.profileImage'])
      .addSelect(['commentedFeed.id'])
      .where('feed_comment.commentedFeedId IN (:feedIds)', { feedIds: feedIds })
      .getMany();
  }
}
