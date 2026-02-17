-- Fix profiles table and RLS policies

-- Add missing columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_workspace_id UUID REFERENCES public.workspaces(id);

-- Update name to display_name for existing records
UPDATE public.profiles SET display_name = name WHERE display_name IS NULL AND name IS NOT NULL;

-- Add INSERT policy for profiles (allows users to create their own profile)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add policy for workspace_members to allow self-insert for workspace owners
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    -- Can add members to own workspace
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
    OR
    -- Can add self as member
    user_id = auth.uid()
  );

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
