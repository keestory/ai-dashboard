import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { SupabaseClient } from '@repo/db';
import type { Tables } from '@repo/db';

export interface Context {
  supabase: SupabaseClient;
  user: Tables<'profiles'> | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const createTRPCRouter = t.router;
