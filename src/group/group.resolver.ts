import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GroupService } from './group.service';
import { Group } from './entities/group.entity';
import { CreateGroupInput } from './dto/create-group.input';

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  async createGroup(@Args('input') input: CreateGroupInput): Promise<Group> {
    return this.groupService.create(input);
  }
}
