import {
  LoginResponseDto,
  SignUpRequestDto,
} from 'src/domain/service/dto/user.dto';

export interface IUserService {
  signUp(userData: SignUpRequestDto): Promise<void>;
  login(email: string, password: string): Promise<LoginResponseDto>;
}
