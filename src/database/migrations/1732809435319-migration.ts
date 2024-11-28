import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1732809435319 implements MigrationInterface {
  name = 'Migration1732809435319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group\` (\`id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tag\` (\`id\` varchar(30) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`custom_permission\` (\`id\` varchar(36) NOT NULL, \`editors\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`custom_permission_viewer\` (\`id\` varchar(36) NOT NULL, \`permissionId\` varchar(255) NOT NULL, \`userId\` varchar(255) NULL, \`groupId\` varchar(255) NULL, UNIQUE INDEX \`IDX_3420e8c3620139f3fdd15af100\` (\`permissionId\`, \`groupId\`), UNIQUE INDEX \`IDX_0200807c9c3a63e11bb089cf24\` (\`permissionId\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tweet\` (\`id\` varchar(36) NOT NULL, \`parentId\` varchar(255) NULL, \`level\` tinyint UNSIGNED NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`authorId\` varchar(255) NOT NULL, \`content\` varchar(280) NOT NULL, \`category\` enum ('Sport', 'Finance', 'Tech', 'News') NULL, \`location\` varchar(30) NULL, \`viewPermissionId\` varchar(255) NULL, \`editPermissionId\` varchar(255) NULL, INDEX \`IDX_9041bd089e17ca3cf153f258a1\` (\`level\`), INDEX \`IDX_5e7c555540d774fecced4204c3\` (\`category\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group_users\` (\`groupId\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, INDEX \`IDX_ba2d59b482905354e872896dba\` (\`groupId\`), INDEX \`IDX_ad937045ed48b757293b2011d3\` (\`userId\`), PRIMARY KEY (\`groupId\`, \`userId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group_groups\` (\`hostId\` varchar(36) NOT NULL, \`guestId\` varchar(36) NOT NULL, INDEX \`IDX_50ebabe96c47555bd2a7d9282e\` (\`hostId\`), INDEX \`IDX_e31b04842a4f05639f417456c5\` (\`guestId\`), PRIMARY KEY (\`hostId\`, \`guestId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tweet_tags_tag\` (\`tweetId\` varchar(36) NOT NULL, \`tagId\` varchar(30) NOT NULL, INDEX \`IDX_89b25a84f12f3d805c5c268d75\` (\`tweetId\`), INDEX \`IDX_747362677736290fd175246740\` (\`tagId\`), PRIMARY KEY (\`tweetId\`, \`tagId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` ADD CONSTRAINT \`FK_05a6b2eaebff9c0fe1901c50dbd\` FOREIGN KEY (\`parentId\`) REFERENCES \`tweet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` ADD CONSTRAINT \`FK_b06b7b38800e34841b5ff4d9370\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` ADD CONSTRAINT \`FK_83d09e3987601bc099a92ce8bf5\` FOREIGN KEY (\`viewPermissionId\`) REFERENCES \`custom_permission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` ADD CONSTRAINT \`FK_4af3d055f5fc13cc7cec0e631c0\` FOREIGN KEY (\`editPermissionId\`) REFERENCES \`custom_permission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_users\` ADD CONSTRAINT \`FK_ba2d59b482905354e872896dba8\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_users\` ADD CONSTRAINT \`FK_ad937045ed48b757293b2011d36\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_groups\` ADD CONSTRAINT \`FK_50ebabe96c47555bd2a7d9282e9\` FOREIGN KEY (\`hostId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_groups\` ADD CONSTRAINT \`FK_e31b04842a4f05639f417456c5d\` FOREIGN KEY (\`guestId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet_tags_tag\` ADD CONSTRAINT \`FK_89b25a84f12f3d805c5c268d755\` FOREIGN KEY (\`tweetId\`) REFERENCES \`tweet\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet_tags_tag\` ADD CONSTRAINT \`FK_747362677736290fd1752467406\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tweet_tags_tag\` DROP FOREIGN KEY \`FK_747362677736290fd1752467406\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet_tags_tag\` DROP FOREIGN KEY \`FK_89b25a84f12f3d805c5c268d755\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_groups\` DROP FOREIGN KEY \`FK_e31b04842a4f05639f417456c5d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_groups\` DROP FOREIGN KEY \`FK_50ebabe96c47555bd2a7d9282e9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_users\` DROP FOREIGN KEY \`FK_ad937045ed48b757293b2011d36\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_users\` DROP FOREIGN KEY \`FK_ba2d59b482905354e872896dba8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` DROP FOREIGN KEY \`FK_4af3d055f5fc13cc7cec0e631c0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` DROP FOREIGN KEY \`FK_83d09e3987601bc099a92ce8bf5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` DROP FOREIGN KEY \`FK_b06b7b38800e34841b5ff4d9370\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweet\` DROP FOREIGN KEY \`FK_05a6b2eaebff9c0fe1901c50dbd\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_747362677736290fd175246740\` ON \`tweet_tags_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_89b25a84f12f3d805c5c268d75\` ON \`tweet_tags_tag\``,
    );
    await queryRunner.query(`DROP TABLE \`tweet_tags_tag\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e31b04842a4f05639f417456c5\` ON \`group_groups\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_50ebabe96c47555bd2a7d9282e\` ON \`group_groups\``,
    );
    await queryRunner.query(`DROP TABLE \`group_groups\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ad937045ed48b757293b2011d3\` ON \`group_users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ba2d59b482905354e872896dba\` ON \`group_users\``,
    );
    await queryRunner.query(`DROP TABLE \`group_users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5e7c555540d774fecced4204c3\` ON \`tweet\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9041bd089e17ca3cf153f258a1\` ON \`tweet\``,
    );
    await queryRunner.query(`DROP TABLE \`tweet\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0200807c9c3a63e11bb089cf24\` ON \`custom_permission_viewer\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3420e8c3620139f3fdd15af100\` ON \`custom_permission_viewer\``,
    );
    await queryRunner.query(`DROP TABLE \`custom_permission_viewer\``);
    await queryRunner.query(`DROP TABLE \`custom_permission\``);
    await queryRunner.query(`DROP TABLE \`tag\``);
    await queryRunner.query(`DROP TABLE \`group\``);
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
