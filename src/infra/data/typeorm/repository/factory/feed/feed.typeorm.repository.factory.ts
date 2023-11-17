import { HttpException, HttpStatus } from '@nestjs/common';
import {
  DataSource,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  Like,
  Repository,
} from 'typeorm';

import { IFeedTypeormRepository } from 'src/infra/data/interactor/repository/feed/orm_interface/feed.typeorm.repository.interface';
import { FeedVo } from '../../../vo/feed.vo';
import { FeedQueryDto, SortParam } from 'src/domain/service/dto/feed.dto';

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
        // const queryOptions = this.queryOptionBuilder(queryDto);
        // return await repository.find({
        //   relations: this.feedFullRelations,
        //   select: this.feedFullRelationsSelect,
        //   ...queryOptions,
        // });
        const userId = 2;

        return await repository.query(
          `
          SELECT
            feed.id,
            feed.content,
            feed.createdAt,
            feed.updatedAt,
            feed_like_json.likes,
            feed_like_json.likesCount,
            feed_comment_json.comments,
            feed_comment_json.commentsCount


          FROM feed
          LEFT JOIN user feed_author ON feed.authorId = feed_author.id
          LEFT JOIN (
            SELECT
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', feed_like.id,
                  'liker', JSON_OBJECT(
                    'id', liker.id,
                    'name', liker.name,
                    'profileImage', liker.profileImage
                  )
                )
              ) AS likes,
              feed_like.likedFeedId AS feedId,
              COUNT(feed_like.id) AS likesCount
            FROM feed_like
            LEFT JOIN user liker ON feed_like.likerId = liker.id
            GROUP BY feed_like.likedFeedId
          ) feed_like_json ON feed_like_json.feedId = feed.id

          LEFT JOIN (
            SELECT
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', feed_comment.id,
                  'content', feed_comment.content,
                  'createdAt', feed_comment.createdAt,
                  'updatedAt', feed_comment.updatedAt,
                  'commenter', JSON_OBJECT(
                    'id', commenter.id,
                    'name', commenter.name,
                    'profileImage', commenter.profileImage
                  )
                )
              ) AS comments,
              feed_comment.commentedFeedId AS feedId,
              COUNT(feed_comment.id) AS commentsCount
            FROM feed_comment
            LEFT JOIN user commenter ON commenter.id = feed_comment.commenterId
            GROUP BY feed_comment.commentedFeedId
          ) feed_comment_json ON feed_comment_json.feedId = feed.id

          ;
        `,
          [userId],
        );

        // const queryBuilder = repository
        //   .createQueryBuilder('feed')
        //   .leftJoin('feed.author', 'author')
        //   .addSelect(['author.id', 'author.name', 'author.profileImage'])
        //   .leftJoin('feed.likes', 'feed_like')
        //   .addSelect(['feed_like.id'])
        //   // .leftJoin('feed_like.liker', 'liker')
        //   // .addSelect(['liker.id', 'liker.name'])
        //   .addSelect('COUNT(feed_like.id)', 'feed.likesCount')
        //   // .leftJoin('feed_like.liker', 'connectedLiker')
        //   // .leftJoin(
        //   //   'user_connection',
        //   //   'connection',
        //   //   'connection.userId = liker.id OR connection.connectedUserId = liker.id',
        //   // )
        //   // .addSelect(['connection.id', 'connection.isAccepted'])
        //   .leftJoin('feed.comments', 'feed_comment')
        //   .addSelect(['feed_comment.id', 'feed_comment.content'])
        //   .leftJoin('feed_comment.commenter', 'commenter')
        //   .addSelect(['commenter.id', 'commenter.name'])
        //   // .where(
        //   //   'connection.userId = :userId OR connection.connectedUserId = :userId',
        //   //   { userId: userId },
        //   // )
        //   .groupBy('feed.id')
        //   .addGroupBy('feed_like.id')
        //   .addGroupBy('feed_comment.id')
        //   // .addGroupBy('')
        //   // .orderBy('COUNT(likesCount)', 'ASC')
        //   .orderBy('feed.updatedAt', 'DESC')
        // return await queryBuilder.getMany();
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

  private queryOptionBuilder(queryDto: FeedQueryDto) {
    const { sort, search, tag, offset, limit } = queryDto;
    const queryOptions: FindManyOptions<FeedVo> = {};
    if (sort) this.getSortOptions(sort, queryOptions);
    if (search) this.getSearchOptions(search, queryOptions);
    if (limit) queryOptions.take = limit;
    if (offset) queryOptions.skip = offset;
    if (tag) this.getTagOptions(tag, queryOptions);
    return queryOptions;
  }

  private getSortOptions(
    sort: SortParam,
    queryOptions: FindManyOptions<FeedVo>,
  ) {
    switch (sort) {
      case 'recent': {
        queryOptions.order = {
          createdAt: 'DESC',
          comments: {
            createdAt: 'DESC',
          },
        };
        break;
      }
      case 'trending': {
        // TODO: change logic to get trending feeds
        queryOptions.select = {};
        queryOptions.order = {
          createdAt: 'DESC',
          comments: {
            createdAt: 'DESC',
          },
        };
        break;
      }
      default: {
        throw new HttpException('INVALID_INPUT', HttpStatus.BAD_REQUEST);
      }
    }
    return queryOptions;
  }

  private getSearchOptions(
    search: string,
    queryOptions: FindManyOptions<FeedVo>,
  ) {
    queryOptions.where = {
      ...queryOptions.where,
      content: Like(`%${search}%`),
    };
    return queryOptions;
  }

  private getTagOptions(tag: string, queryOptions: FindManyOptions<FeedVo>) {
    queryOptions.where = {
      ...queryOptions.where,
      feedTags: {
        tag: {
          tag: tag,
        },
      },
    };
    return queryOptions;
  }

  private feedFullRelations: FindOptionsRelations<FeedVo> = {
    author: true,
    likes: {
      liker: true,
    },
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
    likes: {
      id: true,
      createdAt: true,
      liker: {
        id: true,
        name: true,
      },
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
