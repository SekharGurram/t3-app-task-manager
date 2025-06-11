import { sql } from "drizzle-orm";
import { uuid, text, varchar, timestamp, pgEnum, index, pgTableCreator } from "drizzle-orm/pg-core";
import { users } from "./user";

// 👇 Consistent prefix across all tables, like "t3-app_tasks"
export const createTable = pgTableCreator((name) => `t3-app_${name}`);

export const sessions = createTable(
  "session",
  (t) => ({
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    secret_hash: text("secret_hash"),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull()
  }),
  (t) => [index("user_idx").on(t.userId)],
);
