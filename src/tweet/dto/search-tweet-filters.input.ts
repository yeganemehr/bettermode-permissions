import { Field, ID, InputType } from '@nestjs/graphql';
import { TweetCategory } from '../entities/tweet.entity';

@InputType('FilterTweet')
export class SearchTweetFiltersInput {
  @Field(() => ID, {
    nullable: true,
    description: 'If provided, filter tweets by Author ID',
  })
  authorId?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'If provided, filter tweets by the given hashtag',
  })
  hashtag?: string | null;

  @Field(() => ID, {
    nullable: true,
    description:
      'If provided, filter tweets that are direct reply to the given tweet ID',
  })
  parentTweetId?: string | null;

  @Field(() => TweetCategory, {
    nullable: true,
    description: 'If provided, filter tweets by category',
  })
  category?: TweetCategory | null;

  @Field(() => String, {
    nullable: true,
    description: 'If provided, filter tweets by location',
  })
  location?: string | null;
}
