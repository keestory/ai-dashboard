import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const analysisRouter = router({
  // Optimized: Get analyses for current user without needing workspaceId
  // This eliminates the waterfall of workspace.getCurrent -> analysis.list
  listForCurrentUser: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 20;
      const userId = ctx.user.id;

      // Get workspace and analyses in a single query
      const { data: workspaces } = await ctx.adminSupabase
        .from('workspaces')
        .select(`
          id,
          name,
          analyses (
            id, name, description, file_name, file_url, file_size, file_type,
            status, row_count, column_count, created_at, updated_at, completed_at
          )
        `)
        .eq('owner_id', userId)
        .order('created_at', { foreignTable: 'analyses', ascending: false })
        .limit(1);

      const workspace = workspaces?.[0];
      const analyses = workspace?.analyses || [];

      return {
        workspace: workspace ? { id: workspace.id, name: workspace.name } : null,
        items: analyses.slice(0, limit),
      };
    }),

  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.adminSupabase
        .from('analyses')
        .select('*')
        .eq('workspace_id', input.workspaceId)
        .order('created_at', { ascending: false })
        .limit(input.limit + 1);

      if (input.cursor) {
        query = query.lt('created_at', input.cursor);
      }

      const { data, error } = await query;
      if (error) throw error;

      let nextCursor: string | undefined;
      if (data.length > input.limit) {
        const nextItem = data.pop();
        nextCursor = nextItem?.created_at;
      }

      return {
        items: data,
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.adminSupabase
        .from('analyses')
        .select(`
          *,
          insights(*),
          charts(*),
          actions(*)
        `)
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  getUploadUrl: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        fileName: z.string(),
        fileType: z.enum(['csv', 'xls', 'xlsx']),
        fileSize: z.number().max(500 * 1024 * 1024), // 500MB max
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate file size based on user plan
      const planLimits: Record<string, number> = {
        free: 5 * 1024 * 1024,
        pro: 50 * 1024 * 1024,
        team: 100 * 1024 * 1024,
        business: 500 * 1024 * 1024,
      };

      const maxSize = planLimits[ctx.user.plan] || planLimits.free;
      if (input.fileSize > maxSize) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File size exceeds limit for your plan (${maxSize / 1024 / 1024}MB)`,
        });
      }

      const timestamp = Date.now();
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
      const filePath = `${ctx.user.id}/${timestamp}_${sanitizedFileName}`;

      const { data, error } = await ctx.adminSupabase.storage
        .from('uploads')
        .createSignedUploadUrl(filePath);

      if (error) throw error;

      return {
        uploadUrl: data.signedUrl,
        token: data.token,
        filePath,
        fileUrl: `${ctx.user.id}/${timestamp}_${sanitizedFileName}`,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        fileType: z.enum(['csv', 'xls', 'xlsx']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.adminSupabase
        .from('analyses')
        .insert({
          workspace_id: input.workspaceId,
          user_id: ctx.user.id,
          name: input.name,
          description: input.description,
          file_name: input.fileName,
          file_url: input.fileUrl,
          file_size: input.fileSize,
          file_type: input.fileType,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger background analysis (Edge Function)
      // In production, this would call a Supabase Edge Function
      // await ctx.adminSupabase.functions.invoke('process-analysis', {
      //   body: { analysisId: data.id },
      // });

      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get file URL to delete from storage
      const { data: analysis } = await ctx.adminSupabase
        .from('analyses')
        .select('file_url')
        .eq('id', input.id)
        .single();

      if (analysis?.file_url) {
        await ctx.adminSupabase.storage.from('uploads').remove([analysis.file_url]);
      }

      const { error } = await ctx.adminSupabase
        .from('analyses')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.user.id);

      if (error) throw error;
      return { success: true };
    }),

  rerun: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Reset status and clear previous results
      const { data, error } = await ctx.adminSupabase
        .from('analyses')
        .update({
          status: 'pending',
          columns: null,
          summary: null,
          row_count: null,
          column_count: null,
          completed_at: null,
        })
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) throw error;

      // Delete existing insights, charts, actions
      await ctx.adminSupabase.from('insights').delete().eq('analysis_id', input.id);
      await ctx.adminSupabase.from('charts').delete().eq('analysis_id', input.id);
      await ctx.adminSupabase.from('actions').delete().eq('analysis_id', input.id);

      // Trigger reanalysis
      // await ctx.adminSupabase.functions.invoke('process-analysis', {
      //   body: { analysisId: input.id },
      // });

      return data;
    }),
});
