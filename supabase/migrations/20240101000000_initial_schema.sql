-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'team', 'business');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE file_type AS ENUM ('csv', 'xls', 'xlsx');
CREATE TYPE insight_type AS ENUM ('trend', 'anomaly', 'pattern', 'comparison', 'summary');
CREATE TYPE insight_importance AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE action_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed', 'dismissed');
CREATE TYPE chart_type AS ENUM ('line', 'bar', 'pie', 'scatter', 'heatmap', 'kpi');
CREATE TYPE report_template AS ENUM ('summary', 'detailed', 'comparison', 'custom');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan plan_type DEFAULT 'free',
  analysis_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE public.workspace_members (
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role workspace_role DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Analyses table
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type file_type NOT NULL,
  status analysis_status DEFAULT 'pending',
  row_count INTEGER,
  column_count INTEGER,
  columns JSONB,
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Insights table
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  importance insight_importance DEFAULT 'medium',
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions table
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES public.insights(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority action_priority DEFAULT 'medium',
  status action_status DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charts table
CREATE TABLE public.charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  type chart_type NOT NULL,
  title TEXT NOT NULL,
  config JSONB NOT NULL,
  data JSONB NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template report_template DEFAULT 'summary',
  content JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analyses_workspace ON public.analyses(workspace_id);
CREATE INDEX idx_analyses_user ON public.analyses(user_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_analyses_created ON public.analyses(created_at DESC);
CREATE INDEX idx_insights_analysis ON public.insights(analysis_id);
CREATE INDEX idx_insights_importance ON public.insights(importance);
CREATE INDEX idx_actions_analysis ON public.actions(analysis_id);
CREATE INDEX idx_actions_status ON public.actions(status);
CREATE INDEX idx_charts_analysis ON public.charts(analysis_id);
CREATE INDEX idx_reports_analysis ON public.reports(analysis_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "workspaces_select" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "workspaces_insert" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Analyses policies
CREATE POLICY "analyses_select" ON public.analyses
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "analyses_insert" ON public.analyses
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "analyses_update" ON public.analyses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "analyses_delete" ON public.analyses
  FOR DELETE USING (user_id = auth.uid());

-- Insights policies (follow analysis access)
CREATE POLICY "insights_select" ON public.insights
  FOR SELECT USING (
    analysis_id IN (SELECT id FROM public.analyses)
  );

-- Actions policies
CREATE POLICY "actions_select" ON public.actions
  FOR SELECT USING (
    analysis_id IN (SELECT id FROM public.analyses)
  );

CREATE POLICY "actions_update" ON public.actions
  FOR UPDATE USING (
    analysis_id IN (SELECT id FROM public.analyses)
  );

-- Charts policies
CREATE POLICY "charts_select" ON public.charts
  FOR SELECT USING (
    analysis_id IN (SELECT id FROM public.analyses)
  );

-- Reports policies
CREATE POLICY "reports_select" ON public.reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reports_delete" ON public.reports
  FOR DELETE USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default workspace for new user
  INSERT INTO public.workspaces (name, owner_id)
  VALUES ('My Workspace', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false);

-- Storage policies
CREATE POLICY "uploads_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "uploads_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "uploads_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false);

CREATE POLICY "reports_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "reports_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
