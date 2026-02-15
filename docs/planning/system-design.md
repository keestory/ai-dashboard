# AI Dashboard 시스템 설계서

## 1. 시스템 아키텍처

### 1.1 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌─────────────────────┐              ┌─────────────────────────────────┐   │
│  │     Web App         │              │        Mobile App               │   │
│  │   (Next.js 14)      │              │        (Expo)                   │   │
│  │                     │              │                                 │   │
│  │  ┌───────────────┐  │              │  ┌───────────────────────────┐  │   │
│  │  │ React/RSC     │  │              │  │ React Native              │  │   │
│  │  │ Tailwind CSS  │  │              │  │ NativeWind                │  │   │
│  │  │ tRPC Client   │  │              │  │ tRPC Client               │  │   │
│  │  │ Zustand       │  │              │  │ Zustand                   │  │   │
│  │  │ Recharts      │  │              │  │ React Native Charts       │  │   │
│  │  └───────────────┘  │              │  └───────────────────────────┘  │   │
│  └──────────┬──────────┘              └────────────────┬────────────────┘   │
│             │                                          │                     │
└─────────────┼──────────────────────────────────────────┼─────────────────────┘
              │              HTTPS/WSS                   │
              │                                          │
┌─────────────┼──────────────────────────────────────────┼─────────────────────┐
│             ▼                                          ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API LAYER (Vercel Edge)                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    Next.js API Routes                        │    │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │    │    │
│  │  │  │ tRPC Router  │  │ File Upload  │  │ Webhook Handler  │   │    │    │
│  │  │  │              │  │ (Presigned)  │  │                  │   │    │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────┘   │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      BACKGROUND JOBS                                 │    │
│  │  ┌────────────────────────────────────────────────────────────┐     │    │
│  │  │                 Supabase Edge Functions                     │     │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐    │     │    │
│  │  │  │ File Parser  │  │ AI Analyzer  │  │ Report Generator│    │     │    │
│  │  │  │ (xlsx, csv)  │  │ (Claude API) │  │ (PDF)          │    │     │    │
│  │  │  └──────────────┘  └──────────────┘  └────────────────┘    │     │    │
│  │  └────────────────────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                   BACKEND                                    │
└──────────────────────────────────────────────────────────────────────────────┘
              │                                          │
              ▼                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          SUPABASE                                    │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │  PostgreSQL  │  │   Storage    │  │      Auth                │   │    │
│  │  │              │  │  (Files)     │  │   (Email, OAuth)         │   │    │
│  │  │  - profiles  │  │              │  │                          │   │    │
│  │  │  - analyses  │  │  - uploads/  │  │  - JWT Tokens            │   │    │
│  │  │  - insights  │  │  - reports/  │  │  - Session Management    │   │    │
│  │  │  - actions   │  │              │  │  - OAuth Providers       │   │    │
│  │  │  - charts    │  │              │  │                          │   │    │
│  │  │  - reports   │  │              │  │                          │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────────────────────────────────┐     │    │
│  │  │  Realtime    │  │           Edge Functions                  │     │    │
│  │  │  (WebSocket) │  │  - process-analysis                      │     │    │
│  │  │              │  │  - generate-insights                     │     │    │
│  │  │  - Analysis  │  │  - generate-report                       │     │    │
│  │  │    status    │  │  - send-notification                     │     │    │
│  │  └──────────────┘  └──────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Claude API  │  │  Resend      │  │  Sentry      │  │  Analytics   │    │
│  │  (Anthropic) │  │  (Email)     │  │  (Errors)    │  │  (Mixpanel)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택 상세

| 레이어 | 기술 | 목적 |
|--------|------|------|
| **Frontend (Web)** | Next.js 14 (App Router) | SSR, RSC, 라우팅 |
| | TypeScript | 타입 안정성 |
| | Tailwind CSS | 스타일링 |
| | Zustand | 클라이언트 상태 관리 |
| | tRPC | 타입 안전 API 호출 |
| | Recharts | 차트 시각화 |
| | React Hook Form + Zod | 폼 관리 및 검증 |
| **Frontend (Mobile)** | Expo (React Native) | 크로스 플랫폼 앱 |
| | Expo Router | 앱 네비게이션 |
| | NativeWind | React Native Tailwind |
| **Backend** | Next.js API Routes | API 엔드포인트 |
| | tRPC | 타입 안전 API 레이어 |
| | Supabase Edge Functions | 백그라운드 작업 |
| **Database** | Supabase (PostgreSQL) | 관계형 데이터 |
| | Supabase Storage | 파일 저장소 |
| | Supabase Auth | 인증 |
| | Supabase Realtime | 실시간 업데이트 |
| **AI** | Claude API (Anthropic) | 인사이트 생성 |
| **Infrastructure** | Vercel | 웹 호스팅 |
| | EAS (Expo) | 앱 빌드/배포 |

---

## 2. 데이터 흐름

### 2.1 파일 업로드 및 분석 흐름

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        FILE UPLOAD & ANALYSIS FLOW                        │
└──────────────────────────────────────────────────────────────────────────┘

Client                    API                      Storage            Edge Function
  │                        │                          │                    │
  │ 1. Request upload URL  │                          │                    │
  │───────────────────────>│                          │                    │
  │                        │                          │                    │
  │                        │ 2. Generate signed URL   │                    │
  │                        │─────────────────────────>│                    │
  │                        │                          │                    │
  │                        │<─────────────────────────│                    │
  │ 3. Signed URL          │                          │                    │
  │<───────────────────────│                          │                    │
  │                        │                          │                    │
  │ 4. Direct upload (chunks)                         │                    │
  │──────────────────────────────────────────────────>│                    │
  │                        │                          │                    │
  │                        │                          │ 5. Upload complete │
  │                        │<─────────────────────────│                    │
  │                        │                          │                    │
  │ 6. Create analysis     │                          │                    │
  │───────────────────────>│                          │                    │
  │                        │                          │                    │
  │                        │ 7. Insert analysis record (status: pending)   │
  │                        │─────────────────────────────────────────────> │
  │                        │                          │                    │
  │                        │ 8. Trigger Edge Function │                    │
  │                        │──────────────────────────────────────────────>│
  │                        │                          │                    │
  │ 9. Analysis ID         │                          │                    │
  │<───────────────────────│                          │                    │
  │                        │                          │                    │
  │                        │                          │                    │
  │ 10. Subscribe realtime │                          │ 11. Process file  │
  │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                          │<───────────────────│
  │                        │                          │                    │
  │                        │                          │ 12. Parse data     │
  │                        │                          │    Calculate stats │
  │                        │                          │                    │
  │                        │                          │ 13. Call Claude API│
  │                        │                          │    for insights    │
  │                        │                          │                    │
  │                        │                          │ 14. Save results   │
  │                        │                          │    Update status   │
  │                        │                          │                    │
  │ 15. Realtime update    │                          │                    │
  │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                          │                    │
  │     (status: completed)│                          │                    │
  │                        │                          │                    │
  │ 16. Fetch results      │                          │                    │
  │───────────────────────>│                          │                    │
  │                        │                          │                    │
  │ 17. Analysis + Insights│                          │                    │
  │<───────────────────────│                          │                    │
  │                        │                          │                    │
```

### 2.2 인증 흐름

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                             │
└──────────────────────────────────────────────────────────────────────────┘

                    Email/Password                     OAuth (Google/Kakao)
                          │                                    │
                          ▼                                    ▼
┌─────────────────────────────────────┐  ┌────────────────────────────────┐
│  1. User submits credentials        │  │  1. User clicks OAuth button   │
│                                     │  │                                │
│  2. Supabase Auth validates         │  │  2. Redirect to provider       │
│                                     │  │                                │
│  3. On success:                     │  │  3. User authorizes            │
│     - Create session                │  │                                │
│     - Set HTTP-only cookie          │  │  4. Callback with code         │
│     - Create/update profile         │  │                                │
│                                     │  │  5. Exchange code for token    │
│  4. Redirect to dashboard           │  │                                │
│                                     │  │  6. Create session             │
└─────────────────────────────────────┘  │                                │
                                         │  7. Create/update profile      │
                                         │                                │
                                         │  8. Redirect to dashboard      │
                                         └────────────────────────────────┘

                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          SESSION MANAGEMENT                               │
│                                                                          │
│  - JWT stored in HTTP-only cookie                                        │
│  - Access token: 1 hour expiry                                           │
│  - Refresh token: 7 days expiry                                          │
│  - Auto-refresh on API calls                                             │
│  - Server-side session validation                                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 실시간 업데이트 흐름

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         REALTIME UPDATE FLOW                              │
└──────────────────────────────────────────────────────────────────────────┘

Client (Web/App)              Supabase Realtime              Database
       │                              │                          │
       │ 1. Subscribe to channel      │                          │
       │─────────────────────────────>│                          │
       │    (analyses:user_id)        │                          │
       │                              │                          │
       │ 2. WebSocket connected       │                          │
       │<─────────────────────────────│                          │
       │                              │                          │
       │                              │                          │
       │                              │   3. Analysis updated    │
       │                              │<─────────────────────────│
       │                              │      (status change)     │
       │                              │                          │
       │ 4. Broadcast event           │                          │
       │<─────────────────────────────│                          │
       │    { type: 'UPDATE',         │                          │
       │      record: {...} }         │                          │
       │                              │                          │
       │ 5. Update local state        │                          │
       │    Re-render UI              │                          │
       │                              │                          │

Subscribed Channels:
- analyses:{user_id}     → Analysis status updates
- insights:{analysis_id} → New insights
- actions:{user_id}      → Action status changes
```

---

## 3. API 설계

### 3.1 tRPC 라우터 구조

```typescript
// packages/api/src/root.ts
import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { workspaceRouter } from './routers/workspace';
import { analysisRouter } from './routers/analysis';
import { insightRouter } from './routers/insight';
import { actionRouter } from './routers/action';
import { chartRouter } from './routers/chart';
import { reportRouter } from './routers/report';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  workspace: workspaceRouter,
  analysis: analysisRouter,
  insight: insightRouter,
  action: actionRouter,
  chart: chartRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
```

### 3.2 API 엔드포인트 명세

```
AUTH
────────────────────────────────────────────────────────────────────
POST   /api/trpc/auth.getUser         현재 사용자 정보
POST   /api/trpc/auth.updateProfile   프로필 업데이트
POST   /api/trpc/auth.deleteAccount   계정 삭제

WORKSPACE
────────────────────────────────────────────────────────────────────
POST   /api/trpc/workspace.list       워크스페이스 목록
POST   /api/trpc/workspace.create     워크스페이스 생성
POST   /api/trpc/workspace.update     워크스페이스 수정
POST   /api/trpc/workspace.delete     워크스페이스 삭제
POST   /api/trpc/workspace.invite     멤버 초대
POST   /api/trpc/workspace.removeMember 멤버 제거

ANALYSIS
────────────────────────────────────────────────────────────────────
POST   /api/trpc/analysis.list        분석 목록 (페이지네이션)
POST   /api/trpc/analysis.getById     분석 상세
POST   /api/trpc/analysis.getUploadUrl 업로드 URL 요청
POST   /api/trpc/analysis.create      분석 생성 (업로드 완료 후)
POST   /api/trpc/analysis.delete      분석 삭제
POST   /api/trpc/analysis.rerun       분석 재실행

INSIGHT
────────────────────────────────────────────────────────────────────
POST   /api/trpc/insight.listByAnalysis 분석별 인사이트 목록
POST   /api/trpc/insight.getById      인사이트 상세

ACTION
────────────────────────────────────────────────────────────────────
POST   /api/trpc/action.list          액션 목록 (필터링)
POST   /api/trpc/action.updateStatus  액션 상태 업데이트

CHART
────────────────────────────────────────────────────────────────────
POST   /api/trpc/chart.listByAnalysis 분석별 차트 목록
POST   /api/trpc/chart.updatePosition 차트 위치 업데이트

REPORT
────────────────────────────────────────────────────────────────────
POST   /api/trpc/report.list          리포트 목록
POST   /api/trpc/report.create        리포트 생성
POST   /api/trpc/report.getDownloadUrl 리포트 다운로드 URL
POST   /api/trpc/report.delete        리포트 삭제
```

### 3.3 파일 업로드 API (REST)

```
File Upload (Non-tRPC)
────────────────────────────────────────────────────────────────────
POST   /api/upload/presigned    Presigned URL 요청
POST   /api/upload/complete     업로드 완료 알림

Webhook
────────────────────────────────────────────────────────────────────
POST   /api/webhook/analysis    분석 완료 웹훅 (Edge Function → API)
POST   /api/webhook/stripe      Stripe 결제 웹훅
```

---

## 4. 데이터베이스 설계

### 4.1 ERD

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                ERD                                        │
└──────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐           ┌─────────────────┐
    │  auth.users     │           │    profiles     │
    │  (Supabase)     │──────────>│                 │
    │                 │   1:1     │  id (FK)        │
    │  id             │           │  email          │
    │  email          │           │  name           │
    │  ...            │           │  avatar_url     │
    └─────────────────┘           │  plan           │
                                  │  created_at     │
                                  └────────┬────────┘
                                           │
                               ┌───────────┴───────────┐
                               │                       │
                               ▼                       ▼
                    ┌─────────────────┐     ┌─────────────────────┐
                    │   workspaces    │     │  workspace_members  │
                    │                 │<────│                     │
                    │  id             │ 1:N │  workspace_id (FK)  │
                    │  name           │     │  user_id (FK)       │
                    │  owner_id (FK)  │     │  role               │
                    │  created_at     │     │  created_at         │
                    └────────┬────────┘     └─────────────────────┘
                             │
                             │ 1:N
                             ▼
                    ┌─────────────────┐
                    │    analyses     │
                    │                 │
                    │  id             │
                    │  workspace_id   │
                    │  user_id        │
                    │  name           │
                    │  file_name      │
                    │  file_url       │
                    │  file_size      │
                    │  file_type      │
                    │  status         │
                    │  row_count      │
                    │  column_count   │
                    │  columns (JSON) │
                    │  summary (JSON) │
                    │  created_at     │
                    │  completed_at   │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┬─────────────────┐
           │                 │                 │                 │
           ▼                 ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │  insights   │   │   actions   │   │   charts    │   │  reports    │
    │             │   │             │   │             │   │             │
    │  id         │   │  id         │   │  id         │   │  id         │
    │  analysis_id│   │  analysis_id│   │  analysis_id│   │  analysis_id│
    │  type       │   │  insight_id │   │  type       │   │  user_id    │
    │  title      │   │  title      │   │  title      │   │  name       │
    │  description│   │  description│   │  config     │   │  template   │
    │  importance │   │  priority   │   │  data       │   │  content    │
    │  data       │   │  status     │   │  position   │   │  pdf_url    │
    │  created_at │   │  due_date   │   │  created_at │   │  created_at │
    └─────────────┘   │  created_at │   └─────────────┘   └─────────────┘
                      └─────────────┘
```

### 4.2 인덱스 전략

```sql
-- Performance Indexes
CREATE INDEX idx_analyses_workspace_created ON analyses(workspace_id, created_at DESC);
CREATE INDEX idx_analyses_status ON analyses(status) WHERE status = 'pending';
CREATE INDEX idx_insights_analysis_importance ON insights(analysis_id, importance);
CREATE INDEX idx_actions_user_status ON actions(analysis_id, status);

-- Full-text Search (선택)
CREATE INDEX idx_analyses_name_search ON analyses USING gin(to_tsvector('korean', name));
```

### 4.3 RLS 정책

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: 본인만 조회/수정
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces: 소유자 또는 멤버
CREATE POLICY "workspaces_select" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Analyses: 워크스페이스 멤버
CREATE POLICY "analyses_select" ON analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE w.id = analyses.workspace_id
      AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

-- Insights, Actions, Charts, Reports: 분석 접근 권한 따름
CREATE POLICY "insights_select" ON insights
  FOR SELECT USING (
    analysis_id IN (
      SELECT id FROM analyses WHERE
      EXISTS (
        SELECT 1 FROM workspaces w
        LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE w.id = analyses.workspace_id
        AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
      )
    )
  );
```

---

## 5. 백그라운드 작업

### 5.1 Edge Function 구조

```
supabase/functions/
├── process-analysis/
│   ├── index.ts          # 메인 핸들러
│   ├── parser.ts         # 파일 파싱 (xlsx, csv)
│   ├── analyzer.ts       # 통계 분석
│   ├── ai.ts             # Claude API 호출
│   └── charts.ts         # 차트 데이터 생성
├── generate-report/
│   ├── index.ts
│   └── pdf.ts            # PDF 생성
├── send-notification/
│   ├── index.ts
│   └── email.ts          # 이메일 발송
└── shared/
    ├── supabase.ts       # Supabase 클라이언트
    └── types.ts          # 공유 타입
```

### 5.2 분석 프로세스 상세

```typescript
// supabase/functions/process-analysis/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { parseFile } from './parser.ts';
import { analyzeData } from './analyzer.ts';
import { generateInsights } from './ai.ts';
import { generateCharts } from './charts.ts';

serve(async (req) => {
  const { analysisId } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. 분석 레코드 조회
    const { data: analysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    // 2. 상태 업데이트: processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // 3. 파일 다운로드 및 파싱
    const { data: fileData } = await supabase.storage
      .from('uploads')
      .download(analysis.file_url);

    const parsedData = await parseFile(fileData, analysis.file_type);

    // 4. 데이터 분석
    const { columns, summary, rowCount, columnCount } = analyzeData(parsedData);

    // 5. AI 인사이트 생성
    const insights = await generateInsights(parsedData, summary, columns);

    // 6. 차트 생성
    const charts = generateCharts(parsedData, columns, summary);

    // 7. 액션 추천 생성
    const actions = generateActions(insights);

    // 8. 결과 저장
    await supabase.from('insights').insert(
      insights.map(i => ({ ...i, analysis_id: analysisId }))
    );

    await supabase.from('charts').insert(
      charts.map(c => ({ ...c, analysis_id: analysisId }))
    );

    await supabase.from('actions').insert(
      actions.map(a => ({ ...a, analysis_id: analysisId }))
    );

    // 9. 분석 완료 업데이트
    await supabase
      .from('analyses')
      .update({
        status: 'completed',
        columns,
        summary,
        row_count: rowCount,
        column_count: columnCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // 실패 처리
    await supabase
      .from('analyses')
      .update({ status: 'failed' })
      .eq('id', analysisId);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 5.3 AI 프롬프트 설계

```typescript
// supabase/functions/process-analysis/ai.ts

const INSIGHT_SYSTEM_PROMPT = `
You are a business data analyst expert. Analyze the provided data summary and generate actionable business insights.

Guidelines:
1. Focus on business-relevant findings
2. Identify trends, anomalies, and patterns
3. Provide specific numbers and percentages
4. Rank insights by business impact
5. Use clear, non-technical language
6. Respond in Korean
`;

const INSIGHT_USER_PROMPT = `
## Data Summary
{summary}

## Column Information
{columns}

## Sample Data (first 10 rows)
{sampleData}

## Task
Generate 5 key business insights in the following JSON format:

[
  {
    "type": "trend|anomaly|pattern|comparison|summary",
    "title": "Brief title (max 50 chars)",
    "description": "Detailed explanation (2-3 sentences)",
    "importance": "critical|high|medium|low",
    "data": {
      "metric": "value",
      "change": "percentage or value"
    }
  }
]

Focus on:
1. Significant trends (growth/decline)
2. Unusual values or outliers
3. Notable patterns or correlations
4. Key comparisons (time periods, categories)
5. Summary statistics that matter
`;

export async function generateInsights(
  data: any[],
  summary: Summary,
  columns: Column[]
): Promise<Insight[]> {
  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
  });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: INSIGHT_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: INSIGHT_USER_PROMPT
        .replace('{summary}', JSON.stringify(summary, null, 2))
        .replace('{columns}', JSON.stringify(columns, null, 2))
        .replace('{sampleData}', JSON.stringify(data.slice(0, 10), null, 2))
    }],
  });

  return parseInsightResponse(response.content[0].text);
}
```

---

## 6. 보안 설계

### 6.1 인증 보안

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION SECURITY                          │
└──────────────────────────────────────────────────────────────────────────┘

1. Password Security
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number
   - bcrypt hashing (Supabase default)
   - Rate limiting: 5 attempts per minute

2. Session Security
   - JWT in HTTP-only cookie
   - Secure flag in production
   - SameSite=Lax
   - 1 hour access token expiry
   - 7 days refresh token expiry

3. OAuth Security
   - State parameter validation
   - PKCE for mobile
   - Strict redirect URI validation

4. API Security
   - All endpoints require authentication (except public)
   - Rate limiting: 100 req/min per user
   - Request size limit: 50MB
```

### 6.2 데이터 보안

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             DATA SECURITY                                 │
└──────────────────────────────────────────────────────────────────────────┘

1. Data at Rest
   - PostgreSQL encryption (Supabase managed)
   - Storage encryption (Supabase managed)
   - Sensitive fields encrypted at application level (optional)

2. Data in Transit
   - TLS 1.3 for all connections
   - Certificate pinning for mobile (optional)

3. Data Access Control
   - Row Level Security (RLS) on all tables
   - Workspace-based isolation
   - Audit logging for sensitive operations

4. Data Retention
   - Files: 90 days after deletion
   - Analyses: User-controlled
   - Logs: 30 days

5. Data Export
   - User can export all their data
   - GDPR compliance ready
```

### 6.3 파일 업로드 보안

```typescript
// File Upload Security Checklist

const FILE_SECURITY = {
  // 1. File Type Validation
  allowedTypes: ['csv', 'xls', 'xlsx'],
  mimeTypes: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  // 2. File Size Limits
  maxSize: {
    free: 5 * 1024 * 1024,      // 5MB
    pro: 50 * 1024 * 1024,      // 50MB
    team: 100 * 1024 * 1024,    // 100MB
    business: 500 * 1024 * 1024, // 500MB
  },

  // 3. File Name Sanitization
  sanitizeFileName: (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
      .substring(0, 255);
  },

  // 4. Magic Number Validation
  validateMagicNumber: async (file: File) => {
    const header = await file.slice(0, 8).arrayBuffer();
    // Check for xlsx, xls, csv signatures
  },

  // 5. Virus Scanning (Optional)
  scanForVirus: async (fileUrl: string) => {
    // Integration with ClamAV or similar
  },

  // 6. Storage Path Isolation
  getStoragePath: (userId: string, fileName: string) => {
    return `${userId}/${Date.now()}_${fileName}`;
  },
};
```

---

## 7. 확장성 설계

### 7.1 수평 확장

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         HORIZONTAL SCALING                                │
└──────────────────────────────────────────────────────────────────────────┘

                        Load Balancer (Vercel Edge)
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌─────────┐   ┌─────────┐   ┌─────────┐
              │ Web App │   │ Web App │   │ Web App │
              │ Instance│   │ Instance│   │ Instance│
              └────┬────┘   └────┬────┘   └────┬────┘
                   │             │             │
                   └─────────────┼─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
              ┌───────────┐           ┌───────────────┐
              │ Supabase  │           │ Edge Functions│
              │ (Managed) │           │   (Scaled)    │
              └───────────┘           └───────────────┘

Scaling Strategy:
1. Vercel: Auto-scaling serverless
2. Supabase: Managed scaling (Pro plan+)
3. Edge Functions: Concurrent execution
4. CDN: Static assets cached globally
```

### 7.2 캐싱 전략

```typescript
// Caching Layers

const CACHING_STRATEGY = {
  // 1. Browser Cache (Static Assets)
  staticAssets: {
    images: 'public, max-age=31536000, immutable',
    js_css: 'public, max-age=31536000, immutable',
    fonts: 'public, max-age=31536000, immutable',
  },

  // 2. CDN Cache (Vercel Edge)
  cdn: {
    api: 'private, no-cache',
    publicPages: 'public, s-maxage=3600, stale-while-revalidate=86400',
  },

  // 3. Application Cache (Memory)
  memory: {
    userProfile: 300,        // 5 minutes
    workspaceList: 60,       // 1 minute
    analysisDetail: 30,      // 30 seconds
  },

  // 4. React Query Cache
  reactQuery: {
    staleTime: 30 * 1000,    // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  },
};
```

### 7.3 성능 최적화

```
Performance Optimization Checklist:

Frontend
────────────────────────────────────────
□ Code splitting (Next.js automatic)
□ Image optimization (next/image)
□ Font optimization (next/font)
□ Bundle analysis and tree shaking
□ Lazy loading components
□ Virtual scrolling for long lists
□ Service worker for offline (PWA)

Backend
────────────────────────────────────────
□ Database connection pooling
□ Query optimization (EXPLAIN ANALYZE)
□ Pagination for list endpoints
□ Response compression
□ Rate limiting per endpoint

Data Processing
────────────────────────────────────────
□ Chunked file upload
□ Stream processing for large files
□ Background job queuing
□ Progressive result delivery
```

---

## 8. 모니터링 및 로깅

### 8.1 모니터링 스택

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          MONITORING STACK                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Sentry      │  │    Vercel       │  │   Supabase      │
│   (Errors)      │  │  Analytics      │  │   Dashboard     │
│                 │  │                 │  │                 │
│ - Error capture │  │ - Web Vitals   │  │ - DB metrics    │
│ - Stack traces  │  │ - Page views   │  │ - API logs      │
│ - User context  │  │ - Performance  │  │ - Storage usage │
│ - Release track │  │ - Edge logs    │  │ - Auth events   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│   Mixpanel      │  │  StatusPage     │
│  (Analytics)    │  │   (Status)      │
│                 │  │                 │
│ - User events   │  │ - Uptime       │
│ - Funnels       │  │ - Incidents    │
│ - Retention     │  │ - Maintenance  │
│ - Cohorts       │  │ - Notifications│
└─────────────────┘  └─────────────────┘
```

### 8.2 로깅 전략

```typescript
// Logging Levels and Use Cases

const LOGGING = {
  // ERROR: 시스템 오류, 사용자 영향
  error: {
    examples: [
      'Database connection failed',
      'AI API timeout',
      'File processing failed',
    ],
    action: 'Alert + Sentry',
  },

  // WARN: 잠재적 문제, 주의 필요
  warn: {
    examples: [
      'Rate limit approaching',
      'Slow query detected',
      'Retry succeeded',
    ],
    action: 'Log + Review',
  },

  // INFO: 정상 비즈니스 이벤트
  info: {
    examples: [
      'User signed up',
      'Analysis completed',
      'Report generated',
    ],
    action: 'Log',
  },

  // DEBUG: 개발/디버깅용
  debug: {
    examples: [
      'Function input/output',
      'SQL queries',
      'API responses',
    ],
    action: 'Dev only',
  },
};
```

### 8.3 알림 설정

```yaml
# Alert Rules

critical:
  - name: "API Error Rate > 5%"
    condition: error_rate > 0.05
    window: 5m
    action:
      - slack: "#alerts-critical"
      - pagerduty: true
      - email: "oncall@company.com"

high:
  - name: "Response Time p95 > 3s"
    condition: latency_p95 > 3000
    window: 10m
    action:
      - slack: "#alerts"

medium:
  - name: "AI API Cost > $100/day"
    condition: ai_cost > 100
    window: 1d
    action:
      - slack: "#costs"
      - email: "admin@company.com"

low:
  - name: "Storage Usage > 80%"
    condition: storage_usage > 0.8
    window: 1h
    action:
      - slack: "#ops"
```

---

## 9. 배포 전략

### 9.1 CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. Test & Lint
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test

  # 2. Build Check
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build

  # 3. Deploy Preview (PR)
  preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  # 4. Deploy Production
  production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 9.2 환경 구성

```
Environments
────────────────────────────────────────────────────────────────────

Development
├── URL: localhost:3000
├── DB: Supabase local (Docker)
├── Auth: Test mode
└── AI: Mock responses

Preview (Per PR)
├── URL: pr-{number}.vercel.app
├── DB: Supabase staging
├── Auth: Test accounts
└── AI: Rate-limited

Staging
├── URL: staging.insightflow.app
├── DB: Supabase staging
├── Auth: Full auth
└── AI: Full access

Production
├── URL: insightflow.app
├── DB: Supabase production
├── Auth: Full auth
└── AI: Full access + monitoring
```

---

## 10. 장애 대응

### 10.1 장애 등급

| 등급 | 정의 | 대응 시간 | 예시 |
|------|------|----------|------|
| P1 | 서비스 전체 불가 | 15분 이내 | DB 다운, 전체 API 실패 |
| P2 | 핵심 기능 불가 | 1시간 이내 | 분석 실패, 인증 오류 |
| P3 | 일부 기능 영향 | 4시간 이내 | 특정 차트 오류, 느린 응답 |
| P4 | 사소한 이슈 | 24시간 이내 | UI 버그, 오탈자 |

### 10.2 롤백 절차

```bash
# 1. 이슈 확인
# Vercel Dashboard 또는 Sentry 확인

# 2. 롤백 결정
# P1/P2: 즉시 롤백
# P3/P4: 핫픽스 우선

# 3. Vercel 롤백
vercel rollback

# 4. 데이터베이스 롤백 (필요시)
# Supabase 대시보드에서 PITR 사용

# 5. 모니터링
# 롤백 후 15분간 집중 모니터링

# 6. 포스트모템
# 24시간 내 장애 보고서 작성
```
