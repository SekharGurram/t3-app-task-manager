import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  // schema: "./src/server/db/schema.ts",
  schema:"./src/server/db/schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["t3-app_*"],
} satisfies Config;
