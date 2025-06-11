import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { taskRouter } from './routers/task';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  task: taskRouter,
});
export type AppRouter = typeof appRouter;
