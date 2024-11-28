import { IsUUID, ValidateNested } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';
import { CustomPermissions } from './custom-permissions.input';

@InputType('UpdateTweetPermissions')
export class UpdateTweetPermissionsInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => CustomPermissions, {
    nullable: true,
    description: `if it is null it means the tweet inherits parent tweets permission. If the tweet has no parent, it means everyone can view this tweet.`,
  })
  @ValidateNested()
  viewPermission: CustomPermissions | null;

  @Field(() => CustomPermissions, {
    nullable: true,
    description: `if it is null it means the tweet inherits parent tweets permission. If the tweet has no parent, it means only author can edit this tweet.`,
  })
  @ValidateNested()
  editPermission: CustomPermissions | null;
}
