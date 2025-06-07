import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tasks } from "~/server/db/schemas";
import { eq,desc, and, sql } from "drizzle-orm";
import { Buffer } from "buffer";
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


  getTasks: publicProcedure
    .input(
      z.object({
        status: z.union([statusEnum, z.literal("all")]).optional(), // ✅ allow "all"
        search: z.string().optional(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

      const whereConditions = [];

      if (input?.status && input.status !== "all") {
        whereConditions.push(eq(tasks.status, input.status));
      }

      if (input?.search && input.search.trim() !== "") {
        whereConditions.push(
          sql`LOWER(${tasks.title}) LIKE LOWER(${`%${input.search.trim()}%`})`
        );
      }

      const tasksList = await ctx.db
        .select()
        .from(tasks)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(desc(tasks.updatedAt))
        .limit(limit)
        .offset(offset);

      const totalCountResult = await ctx.db
        .select({ total: sql<number>`count(*)` })
        .from(tasks)
        .where(whereConditions.length ? and(...whereConditions) : undefined);

      const totalCount = totalCountResult[0]?.total ?? 0;

      return {
        tasks: tasksList,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
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
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(tasks)
        .set({
          title: input.title,
          description: input.description,
          status: input.status,
          imageUrl: input.imageUrl ?? "",
          updatedAt: new Date()
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
      const blackbazeAPIService = new BlackbazeAPIService();
      const url = await blackbazeAPIService.uploadToB2(input.name, buffer, input.type);
      return {
        success: true,
        message: "File uploaded Successfully",
        data: url
      };
    }),

  getUploadedFile: publicProcedure
    .input(
      z.object({
        name: z.string()
      })
    )
    .query(async ({ input }) => {
      const blackbazeAPIService = new BlackbazeAPIService();
      const getUrl = await blackbazeAPIService.getSignedUrl(input.name);
      return {
        success: true,
        message: "File gotten Successfully",
        data: getUrl
      };
    }),
});
