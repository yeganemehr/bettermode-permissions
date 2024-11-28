import { Field, ObjectType } from '@nestjs/graphql';
import { Tweet } from '../entities/tweet.entity';

@ObjectType()
export class Timeline {
  @Field(() => [Tweet])
  nodes: Tweet[];

  @Field(() => Boolean)
  hasMore: boolean;
}
