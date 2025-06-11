import { sql } from "drizzle-orm";
import { uuid, text, varchar, timestamp, pgEnum, index, pgTableCreator } from "drizzle-orm/pg-core";
import { users } from "./user";

// 👇 Consistent prefix across all tables, like "t3-app_tasks"
export const createTable = pgTableCreator((name) => `t3-app_${name}`);

// 👇 Enum for status
export const taskStatusEnum = pgEnum("status", ["pending", "in-progress", "completed"]);

export const tasks = createTable(
  "task",
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey(),
    title: t.varchar({ length: 256 }).notNull(),
    description: t.text(), // optional
    status: taskStatusEnum("status").default("pending").notNull(),
    imageUrl: t.text(), // optional
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  }),
  (t) => [index("title_idx").on(t.title)],
);
