import { router } from './trpc';
import { authRouter } from './routers/auth';
import { workspaceRouter } from './routers/workspace';
import { analysisRouter } from './routers/analysis';
import { insightRouter } from './routers/insight';
import { actionRouter } from './routers/action';
import { chartRouter } from './routers/chart';
import { reportRouter } from './routers/report';
import { dashboardRouter } from './routers/dashboard';

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  analysis: analysisRouter,
  insight: insightRouter,
  action: actionRouter,
  chart: chartRouter,
  report: reportRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
