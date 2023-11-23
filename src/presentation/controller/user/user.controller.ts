import {
  Body,
  Controller,
  Inject,
  Post,
  HttpException,
  HttpStatus,
  Req,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';

import { USER_SERVICE } from 'src/domain/service/ioc';
import { IUserService } from 'src/domain/service/user/user.service.interface';
import {
  LoginResponseDto,
  SignUpRequestDto,
} from 'src/domain/service/dto/user.dto';

@Controller('/user')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
  ) {}

  @Post('/signup')
  async signUp(@Body() userData: SignUpRequestDto): Promise<void> {
    if (!userData || !userData.email || !userData.password) {
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    }

    return await this.userService.signUp(userData);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Req() req: Request): Promise<LoginResponseDto> {
    const { email, password } = req.body;
    return await this.userService.login(email, password);
  }
}
