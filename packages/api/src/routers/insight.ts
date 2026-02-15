import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const insightRouter = router({
  listByAnalysis: protectedProcedure
    .input(z.object({ analysisId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('insights')
        .select('*')
        .eq('analysis_id', input.analysisId)
        .order('importance', { ascending: false });

      if (error) throw error;
      return data;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('insights')
        .select(`
          *,
          actions(*)
        `)
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),
});
