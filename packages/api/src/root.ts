import { router } from './trpc';
import { authRouter } from './routers/auth';
import { workspaceRouter } from './routers/workspace';
import { analysisRouter } from './routers/analysis';
import { insightRouter } from './routers/insight';
import { actionRouter } from './routers/action';
import { chartRouter } from './routers/chart';
import { reportRouter } from './routers/report';

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  analysis: analysisRouter,
  insight: insightRouter,
  action: actionRouter,
  chart: chartRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
