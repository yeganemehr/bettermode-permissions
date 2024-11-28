import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Group {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, { lazy: true })
  @JoinTable({ name: 'group_users' })
  users: Promise<User[]>;

  @ManyToMany(() => Group, { lazy: true })
  @JoinTable({
    name: 'group_groups',
    joinColumn: { name: 'hostId' },
    inverseJoinColumn: { name: 'guestId' },
  })
  groups: Promise<Group[]>;
}
