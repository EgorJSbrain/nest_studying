import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { AppModule } from '../app.module';
import { User, UserSchema } from './users.schema';
import { UsersRepository } from './users.repository';
import { ConfigService } from '@nestjs/config';

describe('UsersController', () => {
  let app: INestApplication
  let controller: UsersController;
  let configService: UsersController;
  let httpServer

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
      providers: [UsersRepository, ConfigService],
      controllers: [UsersRepository, UsersController],
    }).compile();

    app = module.createNestApplication()
    controller = module.get<UsersController>(UsersController);
    httpServer = app.getHttpServer()
  })

  // beforeEach(async () => {

  // });

  afterAll(async () => {
    await app?.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
