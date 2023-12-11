import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FeedModule } from './domain/service/module/feed.module';
import { UserModule } from './domain/service/module/user.module';
import { ProfileModule } from './domain/service/module/profile.module';
import { ConnectionModule } from './domain/service/module/connection.module';
import { SecurityModule } from './domain/service/module/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env',
    }),
    SecurityModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '12h',
    }),
    FeedModule,
    UserModule,
    ProfileModule,
    ConnectionModule,
  ],
})
export class AppModule {}
