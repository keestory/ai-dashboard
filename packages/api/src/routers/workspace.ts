import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members(user_id, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members(
            user_id,
            role,
            profiles(id, email, name, avatar_url)
          )
        `)
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('workspaces')
        .insert({
          name: input.name,
          owner_id: ctx.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('workspaces')
        .update({ name: input.name })
        .eq('id', input.id)
        .eq('owner_id', ctx.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('workspaces')
        .delete()
        .eq('id', input.id)
        .eq('owner_id', ctx.user.id);

      if (error) throw error;
      return { success: true };
    }),

  invite: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(['admin', 'member', 'viewer']).default('member'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First check if user is workspace owner
      const { data: workspace } = await ctx.supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', input.workspaceId)
        .single();

      if (!workspace || workspace.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only workspace owner can invite members',
        });
      }

      // Find user by email
      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('id')
        .eq('email', input.email)
        .single();

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const { data, error } = await ctx.supabase
        .from('workspace_members')
        .insert({
          workspace_id: input.workspaceId,
          user_id: profile.id,
          role: input.role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', input.userId);

      if (error) throw error;
      return { success: true };
    }),
});
