import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTweetInput } from './dto/create-tweet.input';
import { UpdateTweetPermissionsInput } from './dto/update-tweet-permissions.input';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import {
  Brackets,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Tag } from './entities/tag.entity';
import {
  CustomPermission,
  CustomPermissionViewer,
  IEditors,
} from './entities/custom-permission.entity';
import { GroupService } from 'src/group/group.service';
import { Timeline } from './dto/timeline.output';
import { TimelineRefreshInput } from './dto/timeline-refresh.input';
import { SearchTweetFiltersInput } from './dto/search-tweet-filters.input';
import { TweetPaginationOutput } from './dto/tweet-pagination.output';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,

    @Inject(GroupService)
    private groupService: GroupService,

    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async create(input: CreateTweetInput) {
    if (input.viewPermission) {
      for (const groupId of input.viewPermission.groupIds) {
        const isMember = await this.groupService.isUserMemberOf(
          input.authorId,
          groupId,
        );
        if (!isMember) {
          throw new Error(
            'you should be a member of a group to add them as viewer',
          );
        }
      }
    }
    if (input.editPermission) {
      for (const groupId of input.editPermission.groupIds) {
        const isMember = await this.groupService.isUserMemberOf(
          input.authorId,
          groupId,
        );
        if (!isMember) {
          throw new Error(
            'you should be a member of a group to add them as editor',
          );
        }
      }
    }

    return await this.entityManager.transaction(async (manager) => {
      let parent: Tweet | null = null;
      if (input.parentTweetId) {
        parent = await manager.findOneByOrFail(Tweet, {
          id: input.parentTweetId,
        });
      }

      let tags: Tag[] = [];
      if (input.hashtags) {
        tags = await manager.save(
          Tag,
          input.hashtags.map((id) => ({ id })),
        );
      }
      let permission = manager.create(CustomPermission);
      if (input.editPermission) {
        const editors: IEditors = { users: [], groups: [] };
        for (const userId of input.editPermission.userIds) {
          editors.users.push(userId);
        }
        for (const groupId of input.editPermission.groupIds) {
          editors.groups.push(groupId);
        }
        permission.editors = editors;
      }

      if (input.viewPermission || input.editPermission) {
        permission = await manager.save(permission);
      }

      if (input.viewPermission) {
        const viewers: CustomPermissionViewer[] = [];
        for (const userId of input.viewPermission.userIds) {
          viewers.push(
            manager.create(CustomPermissionViewer, {
              permissionId: permission.id,
              userId,
            }),
          );
        }
        for (const groupId of input.viewPermission.groupIds) {
          viewers.push(
            manager.create(CustomPermissionViewer, {
              permissionId: permission.id,
              groupId,
            }),
          );
        }
        await manager.save(viewers);
      }

      const tweet = manager.create(Tweet);
      tweet.level = parent ? parent.level + 1 : 0;
      tweet.authorId = input.authorId;
      tweet.content = input.content;
      tweet.category = input.category;
      tweet.parentId = input.parentTweetId;
      tweet.location = input.location;
      tweet.tags = Promise.resolve(tags);

      if (input.viewPermission) {
        tweet.viewPermissionId = permission.id;
      } else if (parent?.viewPermissionId) {
        tweet.viewPermissionId = parent.viewPermissionId;
      }

      if (input.editPermission) {
        tweet.editPermissionId = permission.id;
      } else if (parent?.editPermission) {
        tweet.editPermission = parent.editPermission;
      }

      return await manager.save(tweet);
    });
  }

  async timeline(
    viewerId: string,
    limit: number,
    refresh?: TimelineRefreshInput | null,
  ): Promise<Timeline> {
    const timeline = new Timeline();

    const windows = [
      86400, // last day
      86400 * 7, // last week
      86400 * 30, // last month
    ];

    // With this condition we prevent sending duplicate tweets to client,
    // So basically refresh.oldestTweet here works as cursor since we don't have a "page" paramter
    let minCreatedAt =
      refresh?.last ?? new Date(Date.now() - windows[0] * 1000);

    let tries = 0;
    let tweets: Tweet[];
    do {
      const qb = this.buildQueryForAccessedTweet(
        viewerId,
        this.tweetRepository.createQueryBuilder(),
      )
        .addCommonTableExpression(
          'SELECT userId from group_users WHERE groupId IN (SELECT groupId FROM JoinedGroups)',
          'Friends',
        )
        .andWhere(
          new Brackets((qb) => {
            qb.andWhere('Tweet.createdAt > :minCreatedAt', { minCreatedAt });
            if (refresh?.manual) {
              // Prevent sending duplicate tweets to client
              qb.orWhere('Tweet.createdAt < :minCreatedAt', {
                minCreatedAt: refresh.oldestTweet,
              });
            }
          }),
        )
        .andWhere(
          new Brackets((qb) => {
            qb.orWhere(
              new Brackets((qb) => {
                qb.andWhere('Tweet.level < 2').andWhere(
                  'Tweet.authorId = :viewerId',
                );
              }),
            );

            qb.orWhere('Tweet.level = 0');
            qb.orWhere(
              new Brackets((qb) => {
                qb.andWhere('Tweet.level = 1');
                qb.andWhere('Tweet.authorId in (SELECT userId FROM Friends)');
              }),
            );
          }),
        )
        .orderBy('Tweet.createdAt', 'DESC')
        .limit(limit + 1);
      tweets = await qb.getMany();

      timeline.nodes = tweets.slice(0, limit);
      timeline.hasMore = tweets.length > limit;

      tries++;

      // If we didn't find enough tweets and client desn't have enough tweets already, we go back in time and try to find older tweets.
      if (tweets.length < limit && refresh?.last === undefined) {
        minCreatedAt = new Date(Date.now() - windows[tries] * 1000);
      }
    } while (
      tweets.length < limit &&
      refresh?.last === undefined &&
      tries < windows.length
    );

    return timeline;
  }

  async search(
    viewerId: string,
    limit: number,
    page: number,
    filters?: SearchTweetFiltersInput | null,
  ) {
    if (page < 1) {
      throw new UnprocessableEntityException('page must be >= 1');
    }

    const qb = this.buildQueryForAccessedTweet(
      viewerId,
      this.tweetRepository.createQueryBuilder(),
    )
      .orderBy('Tweet.createdAt', 'DESC')
      // It's not a good idea to use numeric pagination for big table, OFFSET is costly.
      .offset((page - 1) * limit)
      .limit(limit + 1);

    if (filters?.authorId) {
      qb.andWhere('Tweet.authorId = :authorId', { authorId: filters.authorId });
    }
    if (filters?.category) {
      qb.andWhere('Tweet.category = :category', { category: filters.category });
    }
    if (filters?.location) {
      qb.andWhere('Tweet.location LIKE :location', {
        location: filters.location,
      });
    }
    if (filters?.parentTweetId) {
      qb.andWhere('Tweet.parentId = :parentId', {
        parentId: filters.parentTweetId,
      });
    }
    if (filters?.hashtag) {
      qb.innerJoin(
        'tweet_tags_tag',
        'TweetTag',
        '(TweetTag.tweetId=Tweet.id AND TweetTag.tagId = :tagId)',
        { tagId: filters.hashtag },
      );
    }
    const tweets = await qb.getMany();
    const pagination = new TweetPaginationOutput();
    pagination.nodes = tweets.slice(0, limit);
    pagination.hasNextPage = tweets.length > limit;
    return pagination;
  }

  async findOneOrFail(id: string, viewerId?: string) {
    if (!viewerId) {
      return this.tweetRepository.findOneByOrFail({ id });
    }
    return this.buildQueryForAccessedTweet(
      viewerId,
      this.tweetRepository.createQueryBuilder(),
    )
      .andWhere('Tweet.id = :id', { id })
      .getOneOrFail();
  }

  async updatePermissions(input: UpdateTweetPermissionsInput): Promise<Tweet> {
    let tweet = await this.tweetRepository.findOneByOrFail({ id: input.id });
    const parent = await tweet.parent;

    return await this.entityManager.transaction(async (manager) => {
      let permission = manager.create(CustomPermission);

      if (input.editPermission) {
        const editors: IEditors = { users: [], groups: [] };
        for (const userId of input.editPermission.userIds) {
          editors.users.push(userId);
        }
        for (const groupId of input.editPermission.groupIds) {
          editors.groups.push(groupId);
        }
        permission.editors = editors;
      }

      if (input.viewPermission || input.editPermission) {
        permission = await manager.save(permission);
      }

      if (input.viewPermission) {
        const viewers: CustomPermissionViewer[] = [];
        for (const userId of input.viewPermission.userIds) {
          viewers.push(
            manager.create(CustomPermissionViewer, {
              permissionId: permission.id,
              userId,
            }),
          );
        }
        for (const groupId of input.viewPermission.groupIds) {
          viewers.push(
            manager.create(CustomPermissionViewer, {
              permissionId: permission.id,
              groupId,
            }),
          );
        }
        await manager.save(viewers);
      }
      const currentData = {
        viewPermissionId: tweet.viewPermissionId,
        editPermissionId: tweet.editPermissionId,
      };

      if (input.viewPermission) {
        tweet.viewPermissionId = permission.id;
      } else if (parent?.viewPermissionId) {
        tweet.viewPermissionId = parent.viewPermissionId;
      }

      if (input.editPermission) {
        tweet.editPermissionId = permission.id;
      } else if (parent?.editPermission) {
        tweet.editPermissionId = parent.editPermissionId;
      }

      if (
        currentData.viewPermissionId != tweet.viewPermissionId ||
        currentData.editPermissionId != tweet.editPermissionId
      ) {
        tweet = await manager.save(tweet);
      }

      return tweet;
    });
  }

  async softRemove(id: string, actorId?: string) {
    const tweet = await this.findOneOrFail(id, actorId);
    if (actorId) {
      const hasAccess = await this.hasEditAccess(tweet, actorId);
      if (!hasAccess) {
        throw new ForbiddenException("You can't remove this tweet");
      }
    }
    await this.tweetRepository.softDelete(id);
  }

  async hasEditAccess(
    tweet: string | Tweet,
    actorId: string,
  ): Promise<boolean> {
    if (typeof tweet === 'string') {
      try {
        tweet = await this.findOneOrFail(tweet, actorId);
      } catch {
        return false;
      }
    }
    if (tweet.authorId === actorId) {
      return true;
    }

    const permission = await tweet.editPermission;
    if (!permission) {
      return false;
    }
    if (permission.editors.users.includes(actorId)) {
      return true;
    }
    if (permission.editors.groups.length) {
      const joinedGroups = (await this.groupService.findByUser(actorId)).map(
        ({ id }) => id,
      );
      for (const groupId in permission.editors.groups) {
        if (joinedGroups.includes(groupId)) {
          return true;
        }
      }
    }

    return false;
  }

  private buildQueryForAccessedTweet(
    viewerId: string,
    qb: SelectQueryBuilder<Tweet>,
  ): SelectQueryBuilder<Tweet> {
    const joinedGroupsQuery = this.entityManager
      .createQueryBuilder()
      .from('group_users', 'groupUsers')
      .select('groupId')
      .where({
        userId: viewerId,
      });
    const alias = qb.alias;
    return qb
      .addCommonTableExpression(joinedGroupsQuery, 'JoinedGroups')
      .leftJoin(`${alias}.viewPermission`, 'Permission')
      .leftJoin('Permission.viewers', 'Viewer')
      .andWhere(
        new Brackets((qb) => {
          qb.orWhere(`${alias}.viewPermission IS NULL`)
            .orWhere('Viewer.userId = :viewerId ', { viewerId })
            .orWhere('Viewer.groupId in (SELECT groupId FROM JoinedGroups)')
            .orWhere(`${alias}.authorId = :viewerId`);
        }),
      );
  }
}
