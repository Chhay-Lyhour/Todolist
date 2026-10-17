import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792267200000 implements MigrationInterface {
  name = 'InitialSchema1792267200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "todos" (
        "id" SERIAL NOT NULL,
        "title" character varying(200) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'TODO',
        CONSTRAINT "PK_todos_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_todos_status" CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'DONE'))
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" SERIAL NOT NULL,
        "username" character varying NOT NULL,
        "display_name" character varying NOT NULL,
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_profiles_username" UNIQUE ("username")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "profiles" ("id", "username", "display_name")
      VALUES (1, 'Lyhour', 'Lyhour')
    `);
    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('"profiles"', 'id'), 1, true)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "profiles"');
    await queryRunner.query('DROP TABLE "todos"');
  }
}
