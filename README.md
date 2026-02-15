# InsightFlow - AI Data Analytics Dashboard

Excel/CSV 파일을 업로드하면 AI가 자동으로 분석하여 인사이트와 액션을 제안하는 올인원 대시보드 서비스

## Features

- **파일 업로드**: xlsx, xls, csv 파일 지원, 대용량 청크 업로드
- **AI 분석**: 트렌드, 이상치, 패턴 자동 탐지
- **인사이트**: AI 기반 비즈니스 인사이트 도출
- **시각화**: 인터랙티브 차트 및 대시보드
- **액션 추천**: 분석 기반 실행 가능한 액션 제안
- **리포트**: PDF/Excel 내보내기, 이메일 공유
- **모바일 앱**: iOS/Android 네이티브 앱 지원

## Tech Stack

- **Frontend (Web)**: Next.js 14, TypeScript, Tailwind CSS
- **Frontend (Mobile)**: Expo (React Native)
- **Backend**: Next.js API Routes, tRPC
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude API (Anthropic)
- **Charts**: Recharts
- **State**: Zustand
- **Monorepo**: Turborepo

## Project Structure

```
ai-dashboard/
├── apps/
│   ├── web/                 # Next.js web app
│   └── mobile/              # Expo mobile app
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── api/                 # tRPC routers
│   ├── db/                  # Supabase client & types
│   └── utils/               # Shared utilities
├── supabase/
│   ├── functions/           # Edge functions
│   └── migrations/          # Database migrations
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase CLI
- Anthropic API key
- Expo CLI (for mobile development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/ai-dashboard.git
cd ai-dashboard
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
# Edit files with your credentials
```

4. Set up Supabase:
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push
```

5. Start development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev --filter=web # Start web app only

# Build
pnpm build            # Build all apps

# Testing
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI

# Lint & Type Check
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking

# Database
supabase db push      # Push migrations to Supabase
supabase gen types    # Generate TypeScript types
```

### Mobile Development

```bash
cd apps/mobile
npx expo start        # Start Expo dev server

# Build for production
eas build --platform ios
eas build --platform android
```

## Deployment

### Web (Vercel)

```bash
cd apps/web
vercel --prod
```

### Mobile (EAS)

```bash
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all
```

See [Deployment Guide](./docs/ops/deployment-guide.md) for detailed instructions.

## Documentation

- [Service Plan](./docs/planning/service-plan.md)
- [Technical Spec](./docs/planning/spec.md)
- [UX Design](./docs/planning/ux-design.md)
- [UI Design](./docs/planning/ui-design.md)
- [System Design](./docs/planning/system-design.md)
- [Deployment Guide](./docs/ops/deployment-guide.md)

## API Reference

### Upload File

```typescript
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (xlsx, xls, csv)
- workspaceId: string

Response: { success: boolean, analysis: Analysis }
```

### Trigger Analysis

```typescript
POST /api/analyze
Content-Type: application/json

Body: { analysisId: string }

Response: { success: boolean, analysisId: string }
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
