import { Group } from 'src/group/entities/group.entity';
import {
  Check,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export interface IEditors {
  users: string[];
  groups: string[];
}

@Entity()
export class CustomPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json', nullable: true })
  editors: IEditors;

  @OneToMany(() => CustomPermissionViewer, (viewer) => viewer.permission)
  viewers: Promise<CustomPermissionViewer[]>;
}

@Entity()
// Currently, due to the outdated code in TypeORM, this CHECK constraint doesn't work for MySQL (and related) drivers.
// @see https://github.com/typeorm/typeorm/issues/11155
// This isn't a critical issue. It would be better if it worked, but until the issue is resolved, it causes no malfunction in our app.
@Check(
  'user_or_group',
  '(userId is null and `groupId` is not null) or (groupId is null and `userId` is not null)',
)
@Unique(['permissionId', 'userId'])
@Unique(['permissionId', 'groupId'])
export class CustomPermissionViewer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: false })
  permissionId: string;

  @ManyToOne(() => CustomPermission, {
    nullable: false,
    createForeignKeyConstraints: false,
    cascade: true,
  })
  permission: CustomPermission;

  @Column('uuid', { nullable: true })
  userId: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    createForeignKeyConstraints: false,
    cascade: true,
  })
  user: User;

  @Column('uuid', { nullable: true })
  groupId: string | null;

  @ManyToOne(() => Group, {
    nullable: true,
    createForeignKeyConstraints: false,
    cascade: true,
  })
  group: Group;
}
