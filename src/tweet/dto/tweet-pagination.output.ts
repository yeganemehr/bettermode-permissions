import { Field, ObjectType } from '@nestjs/graphql';
import { Tweet } from '../entities/tweet.entity';

@ObjectType('PaginatedTweet')
export class TweetPaginationOutput {
  @Field(() => [Tweet])
  nodes: Tweet[];

  @Field(() => Boolean)
  hasNextPage: boolean;
}
