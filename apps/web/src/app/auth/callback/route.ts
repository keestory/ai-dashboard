import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user after successful auth
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Use admin client to bypass RLS for profile/workspace creation
        const adminClient = createAdminClient();

        // Check if profile exists
        const { data: existingProfile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const displayName = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email?.split('@')[0]
            || 'User';

          const avatarUrl = user.user_metadata?.avatar_url
            || user.user_metadata?.picture;

          const { error: profileError } = await adminClient.from('profiles').insert({
            id: user.id,
            email: user.email!,
            display_name: displayName,
            avatar_url: avatarUrl,
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          // Also create a default workspace for the user
          const { data: workspace, error: workspaceError } = await adminClient
            .from('workspaces')
            .insert({
              name: `${displayName}의 워크스페이스`,
              owner_id: user.id,
            })
            .select()
            .single();

          if (workspaceError) {
            console.error('Workspace creation error:', workspaceError);
          }

          // Add user as admin of their workspace
          if (workspace) {
            await adminClient.from('workspace_members').insert({
              workspace_id: workspace.id,
              user_id: user.id,
              role: 'admin',
            });

            // Update profile with current workspace
            await adminClient
              .from('profiles')
              .update({ current_workspace_id: workspace.id })
              .eq('id', user.id);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
