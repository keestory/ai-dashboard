import { router, protectedProcedure } from '../trpc';

export const dashboardRouter = router({
  // Get dashboard overview data for current user
  // Optimized: reduced from 8 queries to 3 parallel queries
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Query 1: Get workspaces with nested analyses (includes insight counts)
    const { data: workspacesWithAnalyses } = await ctx.adminSupabase
      .from('workspaces')
      .select(`
        id,
        analyses (
          id,
          name,
          status,
          row_count,
          file_name,
          created_at,
          insights (id),
          actions (id, title, description, priority, status, due_date)
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { foreignTable: 'analyses', ascending: false });

    // Flatten all analyses from workspaces
    const allAnalyses = workspacesWithAnalyses?.flatMap(w => w.analyses || []) || [];
    const analysisIds = allAnalyses.map(a => a.id);

    // Get recent 5 analyses with insight counts
    const recentAnalyses = allAnalyses.slice(0, 5).map(a => ({
      id: a.id,
      name: a.file_name || a.name,
      status: a.status as 'pending' | 'processing' | 'completed' | 'failed',
      rowCount: a.row_count || 0,
      insightCount: a.insights?.length || 0,
      createdAt: a.created_at,
    }));

    // Collect all actions from analyses
    const allActions = allAnalyses.flatMap(a =>
      (a.actions || []).map(action => ({ ...action, analysis_id: a.id }))
    );

    // Filter pending actions
    const pendingActions = allActions
      .filter(a => a.status === 'pending' || a.status === 'in_progress')
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
      })
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        priority: a.priority as 'urgent' | 'high' | 'medium' | 'low',
        status: a.status as 'pending' | 'in_progress' | 'completed' | 'dismissed',
        dueDate: a.due_date,
      }));

    // Count completed actions
    const completedActionsCount = allActions.filter(a => a.status === 'completed').length;

    // Query 2: Get top insights (critical and high importance)
    const { data: topInsights } = await ctx.adminSupabase
      .from('insights')
      .select('id, type, title, description, importance, analysis_id')
      .in('analysis_id', analysisIds.length > 0 ? analysisIds : ['00000000-0000-0000-0000-000000000000'])
      .in('importance', ['critical', 'high'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Query 3: Get weekly analyses count and total insights count in parallel
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const workspaceIds = workspacesWithAnalyses?.map(w => w.id) || [];

    const [weeklyResult, insightsResult] = await Promise.all([
      ctx.adminSupabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .in('workspace_id', workspaceIds.length > 0 ? workspaceIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('created_at', oneWeekAgo.toISOString()),
      ctx.adminSupabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .in('analysis_id', analysisIds.length > 0 ? analysisIds : ['00000000-0000-0000-0000-000000000000']),
    ]);

    return {
      recentAnalyses,
      topInsights: topInsights?.map((i) => ({
        id: i.id,
        type: i.type as 'trend' | 'anomaly' | 'pattern' | 'comparison' | 'summary',
        title: i.title,
        description: i.description,
        importance: i.importance as 'critical' | 'high' | 'medium' | 'low',
      })) || [],
      pendingActions,
      stats: {
        totalAnalyses: weeklyResult.count || 0,
        totalInsights: insightsResult.count || 0,
        completedActions: completedActionsCount,
      },
    };
  }),
});
