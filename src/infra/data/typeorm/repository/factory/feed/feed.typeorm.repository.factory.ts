import {
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  Repository,
} from 'typeorm';

import { IFeedTypeormRepository } from 'src/infra/data/interactor/repository/feed/orm_interface/feed.typeorm.repository.interface';
import { FeedVo } from '../../../vo/feed.vo';
import { FeedQueryDto } from 'src/domain/service/dto/feed.dto';

export class FeedTypeormRepositoryFactory {
  static getRepository = (dataSource: DataSource): IFeedTypeormRepository => {
    const repository = dataSource.getRepository(FeedVo);
    const feedTypeormRepository =
      new FeedTypeormRepositoryFactory().extendRepository(repository);
    return feedTypeormRepository;
  };

  private extendRepository(
    repository: Repository<FeedVo>,
  ): IFeedTypeormRepository {
    return repository.extend({
      findWithFeedQuery: async (queryDto: FeedQueryDto) => {
        const { search, tag, offset, limit } = queryDto;
        const queryBuilder = repository
          .createQueryBuilder('feed')
          .leftJoin('feed.likes', 'feed_like')
          .leftJoin('feed_like.liker', 'liker')
          .addSelect([
            'feed_like.id',
            'liker.id',
            'liker.name',
            'liker.profileImage',
          ])
          .leftJoin('feed.comments', 'comment')
          .leftJoin('comment.commenter', 'commenter')
          .addSelect([
            'comment.id',
            'comment.content',
            'comment.createdAt',
            'comment.updatedAt',
            'commenter.id',
            'commenter.name',
            'commenter.profileImage',
          ])
          .leftJoin('feed.feedTags', 'feed_tag')
          .leftJoin('feed_tag.tag', 'tag')
          .addSelect(['feed_tag.id', 'tag.tag', 'tag.id']);
        if (search)
          queryBuilder.where('feed.content LIKE :search', {
            search: `%${search}%`,
          });
        if (tag) queryBuilder.where('tag.tag = :tag', { tag: tag });
        return await queryBuilder
          .orderBy('feed.createdAt', 'DESC')
          .skip(offset)
          .limit(limit)
          .getMany();
      },
      findOneWithRelationsById: async (feedId: number) => {
        const [feed] = await repository.find({
          where: { id: feedId },
          relations: this.feedFullRelations,
          select: this.feedFullRelationsSelect,
        });
        return feed;
      },
    });
  }

  private feedFullRelations: FindOptionsRelations<FeedVo> = {
    author: true,
    likes: true,
    images: true,
    video: true,
    comments: {
      commenter: true,
    },
  };

  private feedFullRelationsSelect: FindOptionsSelect<FeedVo> = {
    author: {
      id: true,
      name: true,
      profileImage: true,
    },
    images: {
      id: true,
      imageUrl: true,
    },
    video: {
      id: true,
      videoUrl: true,
    },
    comments: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      commenter: {
        id: true,
        name: true,
        profileImage: true,
      },
    },
  };
}
