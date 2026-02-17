import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const chartRouter = router({
  listByAnalysis: protectedProcedure
    .input(z.object({ analysisId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.adminSupabase
        .from('charts')
        .select('*')
        .eq('analysis_id', input.analysisId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data;
    }),

  updatePosition: protectedProcedure
    .input(
      z.object({
        charts: z.array(
          z.object({
            id: z.string().uuid(),
            position: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates = input.charts.map((chart) =>
        ctx.adminSupabase
          .from('charts')
          .update({ position: chart.position })
          .eq('id', chart.id)
      );

      await Promise.all(updates);
      return { success: true };
    }),
});
