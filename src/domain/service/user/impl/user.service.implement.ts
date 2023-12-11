import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { IUserService } from '../user.service.interface';
import { USER_REPOSITORY } from 'src/infra/data/interactor/repository/ioc';
import { IUserRepository } from 'src/domain/interactor/data/repository/user.repository.interface';
import {
  LoginResponseDto,
  SignUpRequestDto,
} from 'src/domain/service/dto/user.dto';
import { UserVo } from 'src/infra/data/typeorm/vo/user.vo';
import { SecurityServiceImpl } from '../../security/impl/security.service.implement';

@Injectable()
export class UserServiceImpl implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly securityService: SecurityServiceImpl,
  ) {}

  async signUp(userData: SignUpRequestDto): Promise<void> {
    // 이메일 : ., @ 포함 필수, 2자 이상
    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    if (!emailRegex.test(userData.email)) {
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    }

    // 비밀번호 : 숫자, 소문자, 대문자, 특수문자, 8자 이상
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    }

    const encodedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = encodedPassword;

    return await this.userRepository.create(userData);
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    if (!email) throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    if (!password) throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const { password: hashed, ...userInfo } = user;
    const comparison = await bcrypt.compare(password, hashed);
    if (!comparison)
      throw new HttpException('INVALID_PASSWORD', HttpStatus.BAD_REQUEST);
    const token = this.securityService.sign({
      aud: userInfo.id,
    });
    this.userRepository.findOneByEmail(email);
    return { token: token, user: userInfo };
  }

  async getOne(userId: number): Promise<UserVo | null> {
    return this.userRepository.findOneById(userId);
  }
}
