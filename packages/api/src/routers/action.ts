import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const actionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        analysisId: z.string().uuid().optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase.from('actions').select(`
        *,
        insights(id, title, type),
        analyses(id, name)
      `);

      if (input.analysisId) {
        query = query.eq('analysis_id', input.analysisId);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) throw error;
      return data;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await ctx.supabase
        .from('actions')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});
