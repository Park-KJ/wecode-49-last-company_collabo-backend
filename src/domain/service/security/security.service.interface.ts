import { TokenPayload } from 'src/type/token_payload';

export interface ISecurityService {
  verify(token: string): TokenPayload;
  sign(payload: TokenPayload): string;
}
