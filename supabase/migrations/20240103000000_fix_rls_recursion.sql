-- ============================================================
-- 파일: 20240103000000_fix_rls_recursion.sql
-- 설명: RLS 무한 재귀 문제 해결
-- ============================================================

-- ============================================================
-- 1. 기존 문제가 있는 정책 제거
-- ============================================================
DROP POLICY IF EXISTS "workspaces_select" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;
DROP POLICY IF EXISTS "analyses_select" ON public.analyses;
DROP POLICY IF EXISTS "analyses_insert" ON public.analyses;
DROP POLICY IF EXISTS "insights_select" ON public.insights;
DROP POLICY IF EXISTS "actions_select" ON public.actions;
DROP POLICY IF EXISTS "actions_update" ON public.actions;
DROP POLICY IF EXISTS "charts_select" ON public.charts;

-- ============================================================
-- 2. SECURITY DEFINER 헬퍼 함수
-- 이 함수들은 RLS를 우회하여 직접 테이블을 조회합니다
-- ============================================================

-- 사용자가 접근 가능한 workspace ID 반환
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM workspaces WHERE owner_id = user_uuid
  UNION
  SELECT workspace_id FROM workspace_members WHERE user_id = user_uuid;
$$;

-- 사용자가 소유한 workspace ID 반환
CREATE OR REPLACE FUNCTION public.get_owned_workspace_ids(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM workspaces WHERE owner_id = user_uuid;
$$;

-- 워크스페이스 역할 확인
CREATE OR REPLACE FUNCTION public.has_workspace_role(
  workspace_uuid UUID,
  user_uuid UUID,
  required_roles workspace_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspaces WHERE id = workspace_uuid AND owner_id = user_uuid
    UNION ALL
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
      AND user_id = user_uuid
      AND role = ANY(required_roles)
  );
$$;

-- 사용자가 접근 가능한 analysis ID 반환
CREATE OR REPLACE FUNCTION public.get_user_analysis_ids(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id
  FROM analyses a
  WHERE a.workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = user_uuid
    UNION
    SELECT workspace_id FROM workspace_members WHERE user_id = user_uuid
  );
$$;

-- ============================================================
-- 3. 새로운 RLS 정책 (재귀 없음)
-- ============================================================

-- Workspaces
CREATE POLICY "workspaces_select" ON public.workspaces
  FOR SELECT USING (id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- Workspace Members
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    workspace_id IN (SELECT public.get_owned_workspace_ids(auth.uid()))
  );

CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT public.get_owned_workspace_ids(auth.uid()))
    OR user_id = auth.uid()
  );

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (SELECT public.get_owned_workspace_ids(auth.uid()))
  );

-- Analyses
CREATE POLICY "analyses_select" ON public.analyses
  FOR SELECT USING (
    workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  );

CREATE POLICY "analyses_insert" ON public.analyses
  FOR INSERT WITH CHECK (
    public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner', 'admin', 'member']::workspace_role[])
  );

-- Insights
CREATE POLICY "insights_select" ON public.insights
  FOR SELECT USING (
    analysis_id IN (SELECT public.get_user_analysis_ids(auth.uid()))
  );

-- Actions
CREATE POLICY "actions_select" ON public.actions
  FOR SELECT USING (
    analysis_id IN (SELECT public.get_user_analysis_ids(auth.uid()))
  );

CREATE POLICY "actions_update" ON public.actions
  FOR UPDATE USING (
    analysis_id IN (SELECT public.get_user_analysis_ids(auth.uid()))
  );

-- Charts
CREATE POLICY "charts_select" ON public.charts
  FOR SELECT USING (
    analysis_id IN (SELECT public.get_user_analysis_ids(auth.uid()))
  );

-- ============================================================
-- 4. 권한 부여
-- ============================================================
GRANT EXECUTE ON FUNCTION public.get_user_workspace_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_owned_workspace_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(UUID, UUID, workspace_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_analysis_ids(UUID) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_workspace_ids(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_owned_workspace_ids(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(UUID, UUID, workspace_role[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_analysis_ids(UUID) TO service_role;

-- ============================================================
-- 5. 성능 최적화 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
