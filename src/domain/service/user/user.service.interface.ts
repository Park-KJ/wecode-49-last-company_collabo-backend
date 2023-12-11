import {
  LoginResponseDto,
  SignUpRequestDto,
} from 'src/domain/service/dto/user.dto';
import { UserVo } from 'src/infra/data/typeorm/vo/user.vo';

export interface IUserService {
  signUp(userData: SignUpRequestDto): Promise<void>;
  login(email: string, password: string): Promise<LoginResponseDto>;
  getOne(userId: number): Promise<UserVo | null>;
}
