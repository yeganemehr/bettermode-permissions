import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CustomPermissions {
  @Field(() => [ID])
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @Field(() => [ID])
  @IsUUID(undefined, { each: true })
  groupIds: string[];
}
