import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, type Context } from '@repo/api';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const handler = async (req: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    // Use admin client to bypass RLS for profile operations
    const adminClient = createAdminClient();

    // Try to get existing profile
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      profile = existingProfile;
    } else {
      // Auto-create profile for OAuth users who don't have one
      const displayName = user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split('@')[0]
        || 'User';

      const avatarUrl = user.user_metadata?.avatar_url
        || user.user_metadata?.picture;

      const { data: newProfile, error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error in tRPC:', profileError);
      }

      if (newProfile) {
        profile = newProfile;

        // Create default workspace
        const { data: workspace, error: workspaceError } = await adminClient
          .from('workspaces')
          .insert({
            name: `${displayName}의 워크스페이스`,
            owner_id: user.id,
          })
          .select()
          .single();

        if (workspaceError) {
          console.error('Workspace creation error in tRPC:', workspaceError);
        }

        if (workspace) {
          await adminClient.from('workspace_members').insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: 'admin',
          });

          await adminClient
            .from('profiles')
            .update({ current_workspace_id: workspace.id })
            .eq('id', user.id);

          // Update profile with workspace
          profile = { ...profile, current_workspace_id: workspace.id };
        }
      }
    }
  }

  const adminSupabase = createAdminClient();

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (): Context => ({
      supabase,
      adminSupabase,
      user: profile,
    }),
    onError: ({ error, path }) => {
      console.error(`tRPC Error on '${path}':`, error);
    },
  });
};

export { handler as GET, handler as POST };
