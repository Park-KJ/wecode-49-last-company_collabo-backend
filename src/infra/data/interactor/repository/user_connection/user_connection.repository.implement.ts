import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IUserConnectionRepository } from 'src/domain/interactor/data/repository/user_connection.repository.interface';
import { USER_CONNECTION_TYPEORM_REPOSITORY } from 'src/infra/data/typeorm/repository/ioc';
import { UserConnectionVo } from 'src/infra/data/typeorm/vo/user_connection.vo';

@Injectable()
export class UserConnectionRepositoryImpl implements IUserConnectionRepository {
  constructor(
    @Inject(USER_CONNECTION_TYPEORM_REPOSITORY)
    private readonly userConnectionTypeormRepository: Repository<UserConnectionVo>,
  ) {}

  async findOneWithRelationsById(
    connectionId: number,
  ): Promise<UserConnectionVo | null> {
    return await this.userConnectionTypeormRepository.findOne({
      relations: {
        user: true,
        connectedUser: true,
      },
      where: {
        id: connectionId,
      },
    });
  }

  async remove(connection: UserConnectionVo): Promise<void> {
    await this.userConnectionTypeormRepository.remove(connection);
  }

  async update(connection: UserConnectionVo) {
    await this.userConnectionTypeormRepository.save(connection);
  }

  async findOneWithConnectedUserById(
    connectionId: number,
  ): Promise<UserConnectionVo | null> {
    return await this.userConnectionTypeormRepository.findOne({
      where: { id: connectionId },
      relations: {
        connectedUser: true,
      },
    });
  }

  async create(connection: UserConnectionVo) {
    await this.userConnectionTypeormrepository.save(connection);
  }
}
