import { sql } from "drizzle-orm";
import { uuid, text, varchar, timestamp, pgEnum, index, pgTableCreator } from "drizzle-orm/pg-core";

// 👇 Consistent prefix across all tables, like "t3-app_tasks"
export const createTable = pgTableCreator((name) => `t3-app_${name}`);

export const users = createTable(
  "user",
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey(),
    firstName: t.varchar({ length: 256 }).notNull(),
    lastName: t.varchar({ length: 256 }).notNull(),
    email:t.varchar({ length: 256 }).notNull(),
    hashed_password: text("hashed_password").notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  }),
  (t) => [index("email_idx").on(t.email)],
);
