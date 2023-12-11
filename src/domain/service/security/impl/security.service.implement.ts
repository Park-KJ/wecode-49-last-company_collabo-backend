import { Injectable } from '@nestjs/common';
import { ISecurityService } from '../security.service.interface';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/type/token_payload';

@Injectable()
export class SecurityServiceImpl implements ISecurityService {
  constructor(private readonly JwtService: JwtService) {}

  verify(token: string): TokenPayload {
    return this.JwtService.verify(token);
  }

  sign(payload: TokenPayload): string {
    return this.JwtService.sign(payload);
  }
}
