ALTER TABLE "t3-app_task" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "t3-app_task" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;