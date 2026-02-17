import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const workspaceRouter = router({
  // Get current user's workspace (from profile or first owned workspace)
  // Uses adminSupabase to bypass RLS
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    // First check if user has a current_workspace_id in their profile
    if (ctx.user?.current_workspace_id) {
      const { data: workspace } = await ctx.adminSupabase
        .from('workspaces')
        .select('*')
        .eq('id', ctx.user.current_workspace_id)
        .single();

      if (workspace) return workspace;
    }

    // Otherwise, get the first workspace they own
    const { data: ownedWorkspace } = await ctx.adminSupabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', ctx.user.id)
      .limit(1)
      .single();

    if (ownedWorkspace) return ownedWorkspace;

    // If no workspace exists, create one
    const displayName = ctx.user?.display_name || ctx.user?.name || 'User';
    const { data: newWorkspace, error } = await ctx.adminSupabase
      .from('workspaces')
      .insert({
        name: `${displayName}의 워크스페이스`,
        owner_id: ctx.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add user as admin of their new workspace
    if (newWorkspace) {
      await ctx.adminSupabase.from('workspace_members').insert({
        workspace_id: newWorkspace.id,
        user_id: ctx.user.id,
        role: 'admin',
      });

      // Update profile with current workspace
      await ctx.adminSupabase
        .from('profiles')
        .update({ current_workspace_id: newWorkspace.id })
        .eq('id', ctx.user.id);
    }

    return newWorkspace;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.adminSupabase
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
      const { data, error } = await ctx.adminSupabase
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
      const { data, error } = await ctx.adminSupabase
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
      const { data, error } = await ctx.adminSupabase
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
      const { error } = await ctx.adminSupabase
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
      const { data: workspace } = await ctx.adminSupabase
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

      // Check team member limit based on owner's plan
      const { data: ownerProfile } = await ctx.adminSupabase
        .from('profiles')
        .select('plan')
        .eq('id', workspace.owner_id)
        .single();

      const ownerPlan = ownerProfile?.plan || 'free';

      // Plan-based team member limits
      const TEAM_LIMITS: Record<string, number> = {
        free: 1,     // solo only
        pro: 0,      // unlimited
        team: 5,
        business: 0, // unlimited
      };

      const maxMembers = TEAM_LIMITS[ownerPlan] || 1;

      if (maxMembers > 0) {
        const { count } = await ctx.adminSupabase
          .from('workspace_members')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', input.workspaceId);

        if ((count || 0) >= maxMembers) {
          const planName = ownerPlan === 'free' ? 'Free' : ownerPlan === 'team' ? 'Team' : ownerPlan;
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `${planName} 플랜에서는 최대 ${maxMembers}명까지 초대할 수 있습니다. 업그레이드하여 더 많은 팀원을 초대하세요.`,
          });
        }
      }

      // Find user by email
      const { data: profile } = await ctx.adminSupabase
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

      const { data, error } = await ctx.adminSupabase
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
      const { error } = await ctx.adminSupabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', input.userId);

      if (error) throw error;
      return { success: true };
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(['admin', 'member', 'viewer']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify caller is workspace owner
      const { data: workspace } = await ctx.adminSupabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', input.workspaceId)
        .single();

      if (!workspace || workspace.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only workspace owner can change member roles',
        });
      }

      const { error } = await ctx.adminSupabase
        .from('workspace_members')
        .update({ role: input.role })
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', input.userId);

      if (error) throw error;
      return { success: true };
    }),
});
