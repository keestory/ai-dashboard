import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, type Context } from '@repo/api';
import { createClient } from '@/lib/supabase/server';

const handler = async (req: Request) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (): Context => ({
      supabase,
      user: profile,
    }),
    onError: ({ error, path }) => {
      console.error(`tRPC Error on '${path}':`, error);
    },
  });
};

export { handler as GET, handler as POST };
