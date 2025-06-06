import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tasks } from "~/server/db/schemas";
import { eq, count } from "drizzle-orm";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from 'uuid';
import BlackbazeAPIService from "~/server/services/blackbazeApiService";


const statusEnum = z.enum(["pending", "in-progress", "completed"]);

export const taskRouter = createTRPCRouter({
  createTask: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      status: statusEnum.optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tasks).values({
        title: input.title,
        description: input.description,
        status: input.status ?? "pending",
        imageUrl: input.imageUrl ?? ""
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

      // Fetch paginated tasks
      const tasksList = await ctx.db
        .select()
        .from(tasks)
        .where(input?.status ? eq(tasks.status, input.status) : undefined)
        .limit(limit)
        .offset(offset);

      // Fetch total count for pagination
      const totalCountResult = await ctx.db
      .select({ total: count() }).from(tasks);

      const totalCount = totalCountResult || 0;
      console.log("total count:",totalCount)
      return {
        tasks: tasksList,
        totalCount,
        totalPages: Math.ceil(totalCount[0]?.total || 10 / limit),
        currentPage: page,
      };
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


  uploadFileToBackblaze: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        base64: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const fileName = `${uuidv4()}-${input.name}`;
      const blackbazeAPIService = new BlackbazeAPIService();
      const url = await blackbazeAPIService.uploadToB2(fileName, buffer, input.type);
      return { url };
    }),

  downloadUploadedImage: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const blackbazeAPIService = new BlackbazeAPIService();
      const url = await blackbazeAPIService.getPrivateImageAsBase64(input.fileName);
      return { url };
    }),
});
