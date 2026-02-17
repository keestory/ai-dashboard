import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = await createClient();

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Also manually clear all Supabase cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  }

  return NextResponse.json({ success: true });
}
