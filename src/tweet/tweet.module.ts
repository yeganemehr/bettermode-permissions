import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetResolver } from './tweet.resolver';
import { UserModule } from 'src/user/user.module';
import { Tweet } from './entities/tweet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { GroupModule } from 'src/group/group.module';

@Module({
  imports: [
    UserModule,
    GroupModule,
    TypeOrmModule.forFeature([Tweet]),
    TypeOrmModule.forFeature([Tag]),
  ],
  providers: [TweetResolver, TweetService],
})
export class TweetModule {}
