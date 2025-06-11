ALTER TABLE "t3-app_session" DROP CONSTRAINT "t3-app_session_user_id_t3-app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "t3-app_user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "t3-app_session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "t3-app_session" ALTER COLUMN "user_id" SET DATA TYPE text;