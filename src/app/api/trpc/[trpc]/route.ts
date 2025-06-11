import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

export const dynamic = 'force-dynamic';

const handler = async (req: Request) => {
  const resHeaders = new Headers();

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        resHeaders,
      }),
    responseMeta({ ctx }) {
      if (ctx?.resHeaders) {
        const headers: Record<string, string> = {};
        ctx.resHeaders.forEach((value, key) => {
          headers[key] = value;
        });
        return {
          headers,
        };
      }
      return {};
    },
  });

  return response;
};

export { handler as GET, handler as POST };
