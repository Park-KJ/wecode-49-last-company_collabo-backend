import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';

export const DATA_SOURCE = Symbol.for('DATA_SOURCE');

const TypeormConfigProvider: Provider = {
  provide: DATA_SOURCE,
  useFactory: async () => {
    const dataSource = new DataSource({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_SCHEMA,
      entities: [__dirname + '/../**/*.vo{.ts,.js}'],
      synchronize: true,
      logging: ['query'],
    });

    return dataSource.initialize();
  },
};

@Module({
  providers: [TypeormConfigProvider],
  exports: [TypeormConfigProvider],
})
export class TypeormConfigModule {}
