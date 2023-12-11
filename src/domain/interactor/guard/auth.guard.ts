import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityServiceImpl } from 'src/domain/service/security/impl/security.service.implement';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly securityService: SecurityServiceImpl) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization'];
    try {
      const decoded = this.securityService.verify(token!);
      const userId = decoded.aud;
      req.user = userId;
      return true;
    } catch (error) {
      return false;
    }
  }
}
