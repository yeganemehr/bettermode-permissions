import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { CustomPermission } from './custom-permission.entity';

export enum TweetCategory {
  Sport = 'Sport',
  Finance = 'Finance',
  Tech = 'Tech',
  News = 'News',
}

@ObjectType()
@Entity()
export class Tweet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  parentId: string | null;

  @Field(() => Tweet)
  @ManyToOne(() => Tweet, { nullable: true })
  parent: Promise<Tweet | null>;

  @Column('tinyint', { unsigned: true })
  @Index()
  level: number;

  @Field(() => Date, { name: 'created_at' })
  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => ID)
  @Column('uuid', { nullable: false })
  authorId: string;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  author: Promise<User>;

  @Field(() => String)
  @Column({
    length: 280, // based on real-world limits of X, according to Google
  })
  content: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Promise<Tag[]>;

  @Column({
    type: 'enum',
    enum: TweetCategory,
    nullable: true,
  })
  @Field(() => TweetCategory, { nullable: true })
  @Index()
  category: TweetCategory | null;

  @Column('varchar', { length: 30, nullable: true })
  @Field(() => String, { nullable: true })
  location: string | null;

  @ManyToOne(() => CustomPermission, { nullable: true })
  viewPermission: Promise<CustomPermission | null>;

  @Column('uuid', { nullable: true })
  viewPermissionId: string | null;

  @ManyToOne(() => CustomPermission, { nullable: true })
  editPermission: Promise<CustomPermission | null>;

  @Column('uuid', { nullable: true })
  editPermissionId: string | null;
}

registerEnumType(TweetCategory, {
  name: 'TweetCategory',
});
