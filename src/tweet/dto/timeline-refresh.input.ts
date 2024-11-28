import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TimelineRefreshInput {
  @Field(() => Date)
  last: Date;

  @Field(() => Date)
  oldestTweet: Date;

  @Field(() => Boolean)
  manual: boolean;
}
