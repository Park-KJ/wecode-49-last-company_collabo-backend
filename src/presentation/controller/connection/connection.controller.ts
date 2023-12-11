import {
  Controller,
  Post,
  Get,
  Inject,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { IConnectionService } from 'src/domain/service/connection/connection.service.interface';
import { CONNECTION_SERVICE } from 'src/domain/service/ioc';
import {
  ConnectionDto,
  ConnectionWithUsersDto,
} from 'src/domain/service/dto/connection.dto';
import { AuthUser } from 'src/domain/interactor/decorator/auth.decorator';
import { AuthGuard } from 'src/domain/interactor/guard/auth.guard';

@Controller('/connection')
@UseGuards(AuthGuard)
export class ConnectionController {
  constructor(
    @Inject(CONNECTION_SERVICE)
    private readonly connectionService: IConnectionService,
  ) {}

  @Get('/connected')
  async getConnections(@AuthUser() userId: number) {
    return await this.connectionService.getConnections(userId);
  }

  @Get('/sent')
  async getSent(@AuthUser() userId: number) {
    return await this.connectionService.getSent(userId);
  }

  @Get('/received')
  async getReceived(@AuthUser() userId: number) {
    return await this.connectionService.getReceived(userId);
  }

  @Delete('/:connectionId')
  async deleteConnection(
    @AuthUser() userId: number,
    @Param('connectionId') connectionId: string,
  ) {
    const connectionDto: ConnectionDto = {
      userId: userId,
      connectionId: Number(connectionId),
    };
    return await this.connectionService.deleteConnection(connectionDto);
  }

  @Post('/user/:userId')
  async createConnection(
    @AuthUser() userId: number,
    @Param('userId') connectedUserId: number,
    @Body('message') message: string,
  ): Promise<void> {
    const connectionDto: ConnectionWithUsersDto = {
      userId: userId,
      connectedUserId: Number(connectedUserId),
      message: message,
    };
    return await this.connectionService.createConnection(connectionDto);
  }

  @Patch('/:connectionId')
  async acceptConnection(
    @AuthUser() userId: number,
    @Param('connectionId') connectionId: number,
  ) {
    const connectionDto: ConnectionDto = {
      userId: userId,
      connectionId: connectionId,
    };
    await this.connectionService.acceptConnection(connectionDto);
  }
}
