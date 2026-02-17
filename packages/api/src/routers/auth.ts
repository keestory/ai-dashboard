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
        company: z.string().max(100).optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.company !== undefined) updateData.company = input.company;
      if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;

      const { data, error } = await ctx.adminSupabase
        .from('profiles')
        .update(updateData)
        .eq('id', ctx.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        settings: z.record(z.unknown()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.adminSupabase
        .from('profiles')
        .update({ settings: input.settings })
        .eq('id', ctx.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});
