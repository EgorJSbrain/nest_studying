import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    MongooseModule.forRoot(process.env.DATABASE_URL ?? ''),
    UsersModule,
    BlogsModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
