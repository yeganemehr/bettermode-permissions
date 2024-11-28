import { InputType, Field, ID } from '@nestjs/graphql';
import { TweetCategory } from '../entities/tweet.entity';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CustomPermissions } from './custom-permissions.input';

@InputType('CreateTweet')
export class CreateTweetInput {
  @Field(() => ID)
  @IsUUID()
  authorId: string;

  @Field(() => String)
  @IsString()
  @MaxLength(280)
  content: string;

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  hashtags: string[] | null;

  @Field(() => ID, {
    nullable: true,
    description:
      'The ID of the parent tweet, if the tweet has no parent, it can be null',
  })
  @IsUUID()
  @IsOptional()
  parentTweetId: string | null;

  @Field(() => TweetCategory, { nullable: true })
  @IsEnum(TweetCategory)
  @IsOptional()
  category: TweetCategory | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  location: string | null;

  @Field(() => CustomPermissions, { nullable: true })
  @ValidateNested()
  viewPermission: CustomPermissions | null;

  @Field(() => CustomPermissions, { nullable: true })
  @ValidateNested()
  editPermission: CustomPermissions | null;
}
