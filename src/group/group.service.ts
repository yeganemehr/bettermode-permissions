import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateGroupInput } from './dto/create-group.input';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { EntityManager, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ValidationError } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @Inject(UserService)
    private userService: UserService,

    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async create({ groupIds, userIds }: CreateGroupInput) {
    if (!groupIds.size && !userIds.size) {
      throw new ValidationError();
    }
    const users: User[] = [];
    const groups: Group[] = [];

    for (const id of userIds) {
      const user = await this.userService.findOne(id);
      if (!user) {
        throw new UnprocessableEntityException();
      }
      users.push(user);
    }
    for (const id of groupIds) {
      const group = await this.groupRepository.findOneBy({ id });
      if (!group) {
        throw new UnprocessableEntityException();
      }
      groups.push(group);
    }

    const group = this.groupRepository.create();
    for (const id of groupIds) {
      const group = await this.groupRepository.findOneBy({ id });
      if (!group) {
        throw new UnprocessableEntityException();
      }
      groups.push(group);
    }

    group.users = Promise.resolve(users);
    group.groups = Promise.resolve(groups);
    this.groupRepository.save(group);

    return group;
  }

  findOne(id: string) {
    return this.groupRepository.findOneBy({ id });
  }

  findByUser(user: string) {
    return this.groupRepository
      .createQueryBuilder()
      .innerJoin(
        'group_users',
        'GroupUser',
        'GroupUser.groupId = Group.id AND GroupUser.userId = :userId',
        { userId: user },
      )
      .getMany();
  }

  async isUserMemberOf(userId: string, groupId: string): Promise<boolean> {
    return this.entityManager
      .createQueryBuilder()
      .from('group_users', 'GroupUser')
      .andWhere('groupId = :groupId', { groupId })
      .andWhere('userId = :userId', { userId })
      .getExists();
  }
}
