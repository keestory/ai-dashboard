import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const reportRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        analysisId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('reports')
        .select(`
          *,
          analyses(id, name)
        `)
        .eq('user_id', ctx.user.id);

      if (input.analysisId) {
        query = query.eq('analysis_id', input.analysisId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(
      z.object({
        analysisId: z.string().uuid(),
        name: z.string().min(1).max(100),
        template: z.enum(['summary', 'detailed', 'comparison', 'custom']).default('summary'),
        content: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('reports')
        .insert({
          analysis_id: input.analysisId,
          user_id: ctx.user.id,
          name: input.name,
          template: input.template,
          content: input.content,
        })
        .select()
        .single();

      if (error) throw error;

      // In production, trigger PDF generation
      // await ctx.supabase.functions.invoke('generate-report', {
      //   body: { reportId: data.id },
      // });

      return data;
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: report } = await ctx.supabase
        .from('reports')
        .select('pdf_url')
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
        .single();

      if (!report?.pdf_url) {
        return { url: null };
      }

      const { data, error } = await ctx.supabase.storage
        .from('reports')
        .createSignedUrl(report.pdf_url, 3600); // 1 hour

      if (error) throw error;
      return { url: data.signedUrl };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: report } = await ctx.supabase
        .from('reports')
        .select('pdf_url')
        .eq('id', input.id)
        .single();

      if (report?.pdf_url) {
        await ctx.supabase.storage.from('reports').remove([report.pdf_url]);
      }

      const { error } = await ctx.supabase
        .from('reports')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.user.id);

      if (error) throw error;
      return { success: true };
    }),
});
