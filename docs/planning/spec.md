# AI Dashboard 기술 스펙 명세서

## 1. 시스템 개요

### 1.1 프로젝트명
InsightFlow - AI Dashboard

### 1.2 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend (Web) | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Frontend (App) | Expo (React Native), TypeScript |
| Backend | Next.js API Routes, tRPC |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Auth | Supabase Auth (Email, OAuth) |
| AI | Claude API (Anthropic) / OpenAI API |
| Charts | Recharts |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Monorepo | Turborepo |

### 1.3 프로젝트 구조

```
ai-dashboard/
├── apps/
│   ├── web/                 # Next.js 웹 앱
│   │   ├── app/             # App Router
│   │   ├── components/      # 웹 전용 컴포넌트
│   │   └── ...
│   └── mobile/              # Expo 모바일 앱
│       ├── app/             # Expo Router
│       ├── components/      # 앱 전용 컴포넌트
│       └── ...
├── packages/
│   ├── ui/                  # 공유 UI 컴포넌트
│   ├── api/                 # tRPC 라우터 & 프로시저
│   ├── db/                  # Supabase 클라이언트 & 타입
│   ├── utils/               # 공유 유틸리티
│   └── config/              # 공유 설정 (ESLint, TS)
├── docs/                    # 문서
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 2. 데이터베이스 스키마

### 2.1 ERD 개요

```
users (Supabase Auth)
  ↓ 1:N
workspaces
  ↓ 1:N
analyses
  ↓ 1:N
├── insights
├── actions
├── charts
└── reports

files (Storage)
```

### 2.2 테이블 정의

#### users (Supabase Auth 기본 제공)
```sql
-- Supabase auth.users 확장
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'business')),
  analysis_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### workspaces
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);
```

#### analyses
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'xls', 'xlsx')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  row_count INTEGER,
  column_count INTEGER,
  columns JSONB, -- [{name, type, sample}]
  summary JSONB, -- 기술통계 요약
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_analyses_workspace ON analyses(workspace_id);
CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_analyses_status ON analyses(status);
```

#### insights
```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trend', 'anomaly', 'pattern', 'comparison', 'summary')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  data JSONB, -- 관련 데이터
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_analysis ON insights(analysis_id);
```

#### actions
```sql
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES insights(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_actions_analysis ON actions(analysis_id);
CREATE INDEX idx_actions_status ON actions(status);
```

#### charts
```sql
CREATE TABLE charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('line', 'bar', 'pie', 'scatter', 'heatmap', 'kpi')),
  title TEXT NOT NULL,
  config JSONB NOT NULL, -- 차트 설정
  data JSONB NOT NULL, -- 차트 데이터
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charts_analysis ON charts(analysis_id);
```

#### reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template TEXT DEFAULT 'summary' CHECK (template IN ('summary', 'detailed', 'comparison', 'custom')),
  content JSONB, -- 리포트 구성
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_analysis ON reports(analysis_id);
```

### 2.3 RLS (Row Level Security)

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

-- analyses
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace analyses"
  ON analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE w.id = analyses.workspace_id
      AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
```

---

## 3. API 명세

### 3.1 tRPC 라우터 구조

```typescript
// packages/api/src/root.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,
  workspace: workspaceRouter,
  analysis: analysisRouter,
  insight: insightRouter,
  action: actionRouter,
  chart: chartRouter,
  report: reportRouter,
});
```

### 3.2 Auth Router

```typescript
// packages/api/src/routers/auth.ts
export const authRouter = createTRPCRouter({
  // 현재 사용자 정보
  getUser: protectedProcedure
    .query(({ ctx }) => {
      return ctx.user;
    }),

  // 프로필 업데이트
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      avatarUrl: z.string().url().optional(),
    }))
    .mutation(({ ctx, input }) => {
      // ...
    }),
});
```

### 3.3 Analysis Router

```typescript
// packages/api/src/routers/analysis.ts
export const analysisRouter = createTRPCRouter({
  // 분석 목록 조회
  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // 페이지네이션 처리
    }),

  // 분석 상세 조회
  getById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // 분석 + 인사이트 + 차트 조회
    }),

  // 파일 업로드 URL 요청
  getUploadUrl: protectedProcedure
    .input(z.object({
      workspaceId: z.string().uuid(),
      fileName: z.string(),
      fileType: z.enum(['csv', 'xls', 'xlsx']),
      fileSize: z.number().max(500 * 1024 * 1024), // 500MB
    }))
    .mutation(async ({ ctx, input }) => {
      // Supabase Storage signed URL 생성
    }),

  // 분석 생성 (업로드 완료 후)
  create: protectedProcedure
    .input(z.object({
      workspaceId: z.string().uuid(),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      fileName: z.string(),
      fileUrl: z.string().url(),
      fileSize: z.number(),
      fileType: z.enum(['csv', 'xls', 'xlsx']),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. 분석 레코드 생성 (status: pending)
      // 2. 백그라운드 분석 작업 트리거
    }),

  // 분석 삭제
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 분석 + 관련 데이터 삭제
    }),

  // 분석 재실행
  rerun: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 분석 재실행
    }),
});
```

### 3.4 Insight Router

```typescript
export const insightRouter = createTRPCRouter({
  // 분석별 인사이트 목록
  listByAnalysis: protectedProcedure
    .input(z.object({
      analysisId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // 인사이트 목록 반환
    }),

  // 인사이트 상세
  getById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // 인사이트 + 관련 액션
    }),
});
```

### 3.5 Action Router

```typescript
export const actionRouter = createTRPCRouter({
  // 액션 목록
  list: protectedProcedure
    .input(z.object({
      analysisId: z.string().uuid().optional(),
      status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // 필터링된 액션 목록
    }),

  // 액션 상태 업데이트
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
    }))
    .mutation(async ({ ctx, input }) => {
      // 상태 업데이트
    }),
});
```

### 3.6 Report Router

```typescript
export const reportRouter = createTRPCRouter({
  // 리포트 생성
  create: protectedProcedure
    .input(z.object({
      analysisId: z.string().uuid(),
      name: z.string(),
      template: z.enum(['summary', 'detailed', 'comparison', 'custom']),
    }))
    .mutation(async ({ ctx, input }) => {
      // 리포트 생성 + PDF 생성
    }),

  // PDF 다운로드 URL
  getDownloadUrl: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Signed URL 반환
    }),
});
```

---

## 4. 주요 기능 상세

### 4.1 파일 업로드 프로세스

```typescript
// 1. 클라이언트: Signed URL 요청
const { uploadUrl, fileUrl } = await trpc.analysis.getUploadUrl.mutate({
  workspaceId,
  fileName: file.name,
  fileType: getFileType(file),
  fileSize: file.size,
});

// 2. 클라이언트: 파일 직접 업로드 (청크)
await uploadFileInChunks(file, uploadUrl, {
  chunkSize: 5 * 1024 * 1024, // 5MB
  onProgress: (progress) => setProgress(progress),
});

// 3. 클라이언트: 분석 생성 요청
const analysis = await trpc.analysis.create.mutate({
  workspaceId,
  name: file.name,
  fileUrl,
  fileSize: file.size,
  fileType: getFileType(file),
});

// 4. 서버: 백그라운드 분석 시작 (Edge Function)
```

### 4.2 데이터 분석 파이프라인

```typescript
// packages/api/src/services/analysis.ts

export async function processAnalysis(analysisId: string) {
  const analysis = await getAnalysis(analysisId);

  try {
    // 1. 파일 다운로드 및 파싱
    const data = await parseFile(analysis.fileUrl, analysis.fileType);

    // 2. 데이터 구조 분석
    const columns = analyzeColumns(data);

    // 3. 기술통계 계산
    const summary = calculateSummary(data, columns);

    // 4. 차트 데이터 생성
    const charts = generateCharts(data, columns, summary);

    // 5. AI 인사이트 생성
    const insights = await generateInsights(data, summary, columns);

    // 6. 액션 추천 생성
    const actions = await generateActions(insights);

    // 7. 결과 저장
    await saveAnalysisResults(analysisId, {
      columns,
      summary,
      charts,
      insights,
      actions,
    });

    // 8. 상태 업데이트
    await updateAnalysisStatus(analysisId, 'completed');

  } catch (error) {
    await updateAnalysisStatus(analysisId, 'failed');
    throw error;
  }
}
```

### 4.3 AI 인사이트 생성

```typescript
// packages/api/src/services/ai.ts

const INSIGHT_PROMPT = `
당신은 데이터 분석 전문가입니다. 주어진 데이터 요약을 분석하여 비즈니스 인사이트를 도출하세요.

## 데이터 요약
{summary}

## 컬럼 정보
{columns}

## 요청
다음 형식으로 5개의 핵심 인사이트를 JSON 배열로 반환하세요:

[
  {
    "type": "trend|anomaly|pattern|comparison|summary",
    "title": "한 줄 제목",
    "description": "2-3문장 설명",
    "importance": "low|medium|high|critical",
    "data": { "관련 수치 데이터" }
  }
]

비즈니스 관점에서 실행 가능한 인사이트를 도출하세요.
`;

export async function generateInsights(
  data: any[],
  summary: Summary,
  columns: Column[]
): Promise<Insight[]> {
  const prompt = INSIGHT_PROMPT
    .replace('{summary}', JSON.stringify(summary))
    .replace('{columns}', JSON.stringify(columns));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  return parseInsightsResponse(response);
}
```

### 4.4 PDF 리포트 생성

```typescript
// packages/api/src/services/report.ts

import { jsPDF } from 'jspdf';

export async function generatePDFReport(
  analysis: Analysis,
  insights: Insight[],
  charts: Chart[]
): Promise<Buffer> {
  const doc = new jsPDF();

  // 헤더
  doc.setFontSize(24);
  doc.text(analysis.name, 20, 20);

  // 날짜
  doc.setFontSize(12);
  doc.text(`생성일: ${formatDate(new Date())}`, 20, 30);

  // KPI 요약
  doc.setFontSize(16);
  doc.text('핵심 지표', 20, 50);
  // ... KPI 렌더링

  // 인사이트
  doc.addPage();
  doc.text('AI 인사이트', 20, 20);
  insights.forEach((insight, index) => {
    // ... 인사이트 렌더링
  });

  // 차트
  doc.addPage();
  doc.text('시각화', 20, 20);
  // ... 차트 이미지 삽입

  return doc.output('arraybuffer');
}
```

---

## 5. UI 컴포넌트 명세

### 5.1 공유 컴포넌트 (packages/ui)

```typescript
// Button
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Card
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined';
  padding: 'none' | 'sm' | 'md' | 'lg';
}

// Input
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number';
  label?: string;
  error?: string;
  helper?: string;
}

// FileUpload
interface FileUploadProps {
  accept: string[];
  maxSize: number;
  onUpload: (file: File) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

// Chart
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
}

// InsightCard
interface InsightCardProps {
  insight: Insight;
  onAction?: () => void;
}

// ActionCard
interface ActionCardProps {
  action: Action;
  onStatusChange: (status: ActionStatus) => void;
}

// KPICard
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}
```

### 5.2 페이지별 컴포넌트

```
apps/web/components/
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── MobileNav.tsx
├── dashboard/
│   ├── DashboardGrid.tsx
│   ├── AnalysisList.tsx
│   └── QuickActions.tsx
├── analysis/
│   ├── FileUploader.tsx
│   ├── DataPreview.tsx
│   ├── AnalysisProgress.tsx
│   └── ResultsDashboard.tsx
├── insights/
│   ├── InsightList.tsx
│   ├── InsightDetail.tsx
│   └── InsightFilters.tsx
├── charts/
│   ├── ChartContainer.tsx
│   ├── ChartToolbar.tsx
│   └── ChartLegend.tsx
├── actions/
│   ├── ActionList.tsx
│   ├── ActionDetail.tsx
│   └── ActionProgress.tsx
└── reports/
    ├── ReportBuilder.tsx
    ├── ReportPreview.tsx
    └── ReportExport.tsx
```

---

## 6. 상태 관리

### 6.1 Zustand 스토어

```typescript
// packages/utils/src/stores/analysis.ts

interface AnalysisState {
  // State
  currentAnalysis: Analysis | null;
  analyses: Analysis[];
  isLoading: boolean;
  uploadProgress: number;

  // Actions
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  setAnalyses: (analyses: Analysis[]) => void;
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, data: Partial<Analysis>) => void;
  removeAnalysis: (id: string) => void;
  setUploadProgress: (progress: number) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  analyses: [],
  isLoading: false,
  uploadProgress: 0,

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setAnalyses: (analyses) => set({ analyses }),
  addAnalysis: (analysis) => set((state) => ({
    analyses: [analysis, ...state.analyses]
  })),
  updateAnalysis: (id, data) => set((state) => ({
    analyses: state.analyses.map((a) =>
      a.id === id ? { ...a, ...data } : a
    ),
  })),
  removeAnalysis: (id) => set((state) => ({
    analyses: state.analyses.filter((a) => a.id !== id),
  })),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
}));
```

---

## 7. 환경 변수

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=InsightFlow

# Analytics (Optional)
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_GA_ID=
```

---

## 8. 테스트 전략

### 8.1 테스트 유형

| 유형 | 도구 | 대상 |
|------|------|------|
| Unit | Vitest | 유틸리티, 서비스 |
| Integration | Vitest | API 라우터 |
| E2E | Playwright | 사용자 플로우 |
| Component | Storybook | UI 컴포넌트 |

### 8.2 테스트 커버리지 목표

| 영역 | 목표 |
|------|------|
| API | 80% |
| Services | 90% |
| Utils | 95% |
| Components | 70% |

---

## 9. 배포 전략

### 9.1 환경

| 환경 | URL | 용도 |
|------|-----|------|
| Development | localhost:3000 | 로컬 개발 |
| Preview | pr-*.vercel.app | PR 리뷰 |
| Staging | staging.insightflow.app | QA |
| Production | insightflow.app | 프로덕션 |

### 9.2 CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm type-check

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v25
```

---

## 10. 보안 체크리스트

- [ ] RLS 정책 적용
- [ ] API Rate Limiting
- [ ] Input Validation (Zod)
- [ ] XSS Prevention
- [ ] CSRF Protection
- [ ] Secure Headers
- [ ] File Upload Validation
- [ ] Environment Variables Protection
- [ ] Audit Logging
- [ ] Data Encryption at Rest
