import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const authRouter = router({
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update({
          name: input.name,
          avatar_url: input.avatarUrl,
        })
        .eq('id', ctx.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});
