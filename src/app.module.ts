import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { TweetModule } from './tweet/tweet.module';
import { dataStoreFactory } from './database/data-store.factory';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: dataStoreFactory,
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
    }),
    UserModule,
    GroupModule,
    TweetModule,
  ],
})
export class AppModule {}
