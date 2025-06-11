ALTER TABLE "t3-app_user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "t3-app_session" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "t3-app_session" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "t3-app_session" ADD CONSTRAINT "t3-app_session_user_id_t3-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3-app_user"("id") ON DELETE no action ON UPDATE no action;