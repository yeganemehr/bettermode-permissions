import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { TweetService } from './tweet.service';
import { Tweet } from './entities/tweet.entity';
import { CreateTweetInput } from './dto/create-tweet.input';
import { UpdateTweetPermissionsInput } from './dto/update-tweet-permissions.input';
import { TimelineRefreshInput } from './dto/timeline-refresh.input';
import { Timeline } from './dto/timeline.output';
import { TweetPaginationOutput } from './dto/tweet-pagination.output';
import { SearchTweetFiltersInput } from './dto/search-tweet-filters.input';

@Resolver(() => Tweet)
export class TweetResolver {
  constructor(private readonly tweetService: TweetService) {}

  @Mutation(() => Tweet)
  async createTweet(
    @Args({ name: 'input', type: () => CreateTweetInput })
    input: CreateTweetInput,
  ) {
    return this.tweetService.create(input);
  }

  @Query(() => Timeline, { name: 'timeline' })
  async timeline(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args({ name: 'limit', type: () => Int }) limit: number,
    @Args({ name: 'refresh', type: () => TimelineRefreshInput, nullable: true })
    refresh: TimelineRefreshInput | null,
  ): Promise<Timeline> {
    return this.tweetService.timeline(userId, limit, refresh);
  }

  @Query(() => TweetPaginationOutput, { name: 'searchTweets' })
  async search(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args({ name: 'limit', type: () => Int }) limit: number,
    @Args({ name: 'page', type: () => Int }) page: number,
    @Args({
      name: 'filters',
      type: () => SearchTweetFiltersInput,
      nullable: true,
    })
    filters: SearchTweetFiltersInput | null,
  ) {
    return this.tweetService.search(userId, limit, page, filters);
  }

  @Mutation(() => Boolean)
  async updateTweetPermissions(
    @Args({ name: 'input', type: () => UpdateTweetPermissionsInput })
    input: UpdateTweetPermissionsInput,
  ) {
    await this.tweetService.updatePermissions(input);
    return true;
  }

  @Mutation(() => ID)
  async removeTweet(
    @Args({ name: 'id', type: () => ID }) id: string,
    @Args({ name: 'userId', type: () => ID }) userId: string,
  ) {
    await this.tweetService.softRemove(id, userId);

    return id;
  }
}
