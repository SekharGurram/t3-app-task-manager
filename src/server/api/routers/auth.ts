import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { eq} from "drizzle-orm";
import { users } from "~/server/db/schemas";
import { hashPassword} from "~/server/utils/auth";

export const authRouter = createTRPCRouter({
    register: publicProcedure
        .input(z.object({ firstName: z.string(), lastName: z.string(), email: z.string().email(), password: z.string().min(6) }))
        .mutation(async ({ ctx, input }) => {
            const existedUser = await ctx.db
                .select()
                .from(users)
                .where(eq(users.email, input.email))
                .limit(1);
            if (existedUser.length > 0) throw new Error("User already exists");
            let hashed_password = await hashPassword(input.password);
            const user: any = await ctx.db.insert(users).values({
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                hashed_password
            }).returning();
            return user;
        })
});
