import { ConfigService } from '@nestjs/config';
import { Group } from 'src/group/entities/group.entity';
import {
  CustomPermission,
  CustomPermissionViewer,
} from 'src/tweet/entities/custom-permission.entity';
import { Tag } from 'src/tweet/entities/tag.entity';
import { Tweet } from 'src/tweet/entities/tweet.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSourceOptions } from 'typeorm';
import { Migration1732809435319 } from './migrations/1732809435319-migration';

export function dataStoreFactory(
  configService: ConfigService,
): DataSourceOptions {
  return {
    type: 'mysql',
    host: configService.get('MYSQL_HOST', 'localhost'),
    port: +configService.get<number>('MYSQL_PORT', 3306),
    username: configService.get('MYSQL_USER'),
    password: configService.get('MYSQL_PASSWORD'),
    database: configService.get('MYSQL_DB'),
    entities: [
      User,
      Group,
      Tag,
      Tweet,
      CustomPermission,
      CustomPermissionViewer,
    ],
    migrations: [Migration1732809435319],
  };
}
