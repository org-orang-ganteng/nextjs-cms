import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // IF NOT EXISTS: database yang sudah di-push mode dev (`pnpm dev`) bisa sudah memiliki kolom ini.
  await db.execute(sql`
   ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "expires_at" timestamp(3) with time zone;
  ALTER TABLE "_announcements_v" ADD COLUMN IF NOT EXISTS "version_expires_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" varchar;
  -- Akun lama diberi username dari email agar tidak ada data yang hilang.
  UPDATE "users" SET "username" = lower(split_part("email", '@', 1)) || '-' || "id" WHERE "username" IS NULL;
  ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
  CREATE INDEX IF NOT EXISTS "announcements_expires_at_idx" ON "announcements" USING btree ("expires_at");
  CREATE INDEX IF NOT EXISTS "_announcements_v_version_version_expires_at_idx" ON "_announcements_v" USING btree ("version_expires_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "announcements_expires_at_idx";
  DROP INDEX "_announcements_v_version_version_expires_at_idx";
  DROP INDEX "users_username_idx";
  ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "announcements" DROP COLUMN "expires_at";
  ALTER TABLE "_announcements_v" DROP COLUMN "version_expires_at";
  ALTER TABLE "users" DROP COLUMN "username";`)
}
