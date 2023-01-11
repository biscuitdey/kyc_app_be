import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1673423542832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        create table users (
            id bigserial primary key,
            name text,
            validated boolean not null default false,
            bankStatus text,
            panStatus text
        );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`drop table users;`);
  }
}
