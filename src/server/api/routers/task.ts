import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tasks } from "~/server/db/schemas";
import { eq } from "drizzle-orm";
const statusEnum = z.enum(["pending", "in-progress", "completed"]);

export const taskRouter = createTRPCRouter({
  createTask: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      status: statusEnum.optional(),
      image_url: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tasks).values({
        title: input.title,
        description: input.description,
        status: input.status ?? "pending",
        imageUrl: input.image_url ?? ""
      })
    }),


getTaskById: publicProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const task = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, input.id))
      .limit(1);
    return task[0] ?? null;
  }),


  getTaks: publicProcedure
    .input(z.object({
      status: statusEnum.optional(),
      page: z.number().min(1).optional(),
      limit: z.number().min(1).max(100).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;
      return await ctx.db
        .select()
        .from(tasks)
        .where(input?.status ? eq(tasks.status, input.status) : undefined)
        .limit(limit)
        .offset(offset);
    }),

  updateTask: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        status: statusEnum,
        image_url: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(tasks)
        .set({
          title: input.title,
          description: input.description,
          status: input.status,
          imageUrl: input.image_url ?? "",
        })
        .where(eq(tasks.id, input.id));
    }),


  deleteTask: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(tasks).where(eq(tasks.id, input.id))
    }),
  getLatest: publicProcedure.query(async ({ ctx }) => {
    const task = await ctx.db.query.posts.findFirst({
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    return task ?? null;
  }),
});
