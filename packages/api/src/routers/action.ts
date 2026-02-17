import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const actionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        analysisId: z.string().uuid().optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // First get user's workspace to scope actions
      const { data: workspaces } = await ctx.adminSupabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId);

      if (!workspaces || workspaces.length === 0) return [];

      const workspaceIds = workspaces.map(w => w.id);

      // Get analyses belonging to user's workspaces
      const { data: analyses } = await ctx.adminSupabase
        .from('analyses')
        .select('id')
        .in('workspace_id', workspaceIds);

      if (!analyses || analyses.length === 0) return [];

      const analysisIds = analyses.map(a => a.id);

      let query = ctx.adminSupabase.from('actions').select(`
        *,
        insights(id, title, type),
        analyses(id, name)
      `).in('analysis_id', analysisIds);

      if (input?.analysisId) {
        query = query.eq('analysis_id', input.analysisId);
      }

      if (input?.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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

      const { data, error } = await ctx.adminSupabase
        .from('actions')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});
