ALTER TABLE "t3-app_session" ADD COLUMN "expires_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "t3-app_session" DROP COLUMN "updated_at";