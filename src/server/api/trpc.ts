/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { lucia } from "../config/auth";
import { db } from "../db";
import { type User } from "lucia";
import { type Session } from "lucia";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  resHeaders?: Headers;
}) => {
  const cookieHeader = opts.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, decodeURIComponent(v.join("="))];
    })
  );
  const sessionId = cookies["auth_session"];
  let user: User | null = null;
  let session: Session | null = null;

  if (sessionId) {
    try {
      const result = await lucia.validateSession(sessionId);
      session = result.session;
      user = result.user;
    } catch (error) {
      console.error("Error validating Lucia session:", error);
    }
  }
  return {
    db,
    headers: opts.headers,
    resHeaders: opts.resHeaders,
    user,
    session,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE
 */
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/**
 * Middleware for logging and artificial delay (dev only)
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[tRPC] ${path} took ${end - start}ms`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.session) {
      throw new Error("UNAUTHORIZED");
    }

    return next({
      ctx: {
        user: ctx.user,
        session: ctx.session,
      },
    });
  });
