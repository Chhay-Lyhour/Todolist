import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InitialSchema1792267200000 } from '../migrations/1792267200000-InitialSchema.js';
import { Profile } from '../profile/entities/profile.entity.js';
import { Todo } from '../todos/entities/todo.entity.js';

export const DATABASE_DATA_SOURCE = 'DATABASE_DATA_SOURCE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_DATA_SOURCE,
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST ?? 'localhost',
          port: Number(process.env.DB_PORT ?? 5432),
          username: process.env.DB_USERNAME ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: process.env.DB_NAME ?? 'todo',
          entities: [Todo, Profile],
          migrations: [InitialSchema1792267200000],
          migrationsRun: true,
          synchronize: false,
        });
        return dataSource.initialize();
      },
    },
  ],
  exports: [DATABASE_DATA_SOURCE],
})
export class DatabaseModule {}
