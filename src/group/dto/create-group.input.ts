import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType('CreateGroup')
export class CreateGroupInput {
  @Field(() => [ID], { description: 'The user IDs that are part this Group' })
  @IsUUID(undefined, { each: true })
  userIds: Set<string>;

  @Field(() => [ID], {
    description: 'The group IDs that are part of this Group',
  })
  @IsUUID(undefined, { each: true })
  groupIds: Set<string>;
}
