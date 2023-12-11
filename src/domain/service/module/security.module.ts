import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SecurityServiceImpl } from '../security/impl/security.service.implement';

@Module({})
@Global()
export class SecurityModule {
  static register(options: {
    global: boolean;
    secret: string | undefined;
    expiresIn: string;
  }): DynamicModule {
    return {
      module: SecurityModule,
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            global: options.global,
            secret: configService.get('JWT_SECRET_KEY'),
            signOptions: { expiresIn: options.expiresIn },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [SecurityServiceImpl],
      exports: [SecurityServiceImpl],
    };
  }
}
