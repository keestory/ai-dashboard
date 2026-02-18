import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Json } from '@repo/db';

// Allow longer execution for AI analysis
export const maxDuration = 120; // 2 minutes

interface ColumnInfo {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  sampleValues: string[];
  nullCount: number;
  uniqueCount: number;
}

interface Summary {
  totalRows: number;
  totalColumns: number;
  numericColumns: {
    name: string;
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  }[];
  categoricalColumns: {
    name: string;
    topValues: { value: string; count: number }[];
  }[];
  businessKPIs?: {
    label: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }[];
  executiveSummary?: string;
}

interface AIAnalysisResult {
  executiveSummary: string;
  businessKPIs: {
    label: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }[];
  insights: {
    type: string;
    title: string;
    description: string;
    importance: string;
    data: unknown;
  }[];
  actions: {
    title: string;
    description: string;
    priority: string;
  }[];
  chartSuggestions: {
    type: string;
    title: string;
    xKey: string;
    yKey: string;
    description: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId, role: requestRole, customRole: requestCustomRole } = await request.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    // Get analysis record
    const { data: analysis, error: analysisError } = await adminClient
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const typedAnalysis = analysis as any;

    // Update status to processing
    await adminClient
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // Download file
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('uploads')
      .download(typedAnalysis.file_url);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Parse CSV
    const fileText = await fileData.text();
    const parsedData = parseCSV(fileText);

    if (parsedData.length === 0) {
      throw new Error('No data found in file');
    }

    // Analyze data structure
    const columns = analyzeColumns(parsedData);
    const summary = calculateSummary(parsedData, columns);

    // Determine role and custom role from request or analysis description
    const descriptionRole = typedAnalysis.description?.match(/role:(\w+)\|/)?.[1];
    const descriptionCustomRole = typedAnalysis.description?.match(/customRole:([^|]*)\|/)?.[1];
    const role = requestRole || descriptionRole || 'team_member';
    const customRole = requestCustomRole || descriptionCustomRole || '';

    // Generate AI analysis (single comprehensive call)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    let aiResult: AIAnalysisResult | null = null;

    if (anthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      aiResult = await generateComprehensiveAnalysis(anthropic, parsedData, columns, summary, role, customRole);
    }

    // Build charts: AI-suggested + fallback auto-generated
    const charts = buildCharts(parsedData, columns, summary, aiResult?.chartSuggestions || []);

    // Use AI results or fallback
    const insights = aiResult?.insights || generateBasicInsights(summary);
    const actions = aiResult?.actions || generateBasicActions(insights);

    // Store business KPIs and executive summary in summary
    const enrichedSummary: Summary = {
      ...summary,
      businessKPIs: aiResult?.businessKPIs || [],
      executiveSummary: aiResult?.executiveSummary || '',
    };

    // Save results
    if (insights.length > 0) {
      await adminClient
        .from('insights')
        .insert(insights.map(i => ({
          analysis_id: analysisId,
          type: i.type,
          title: i.title,
          description: i.description,
          importance: i.importance,
          data: i.data,
        })) as any);
    }

    if (charts.length > 0) {
      await adminClient
        .from('charts')
        .insert(charts.map((c, index) => ({
          analysis_id: analysisId,
          type: c.type,
          title: c.title,
          config: c.config,
          data: c.data,
          position: index,
        })) as any);
    }

    if (actions.length > 0) {
      await adminClient
        .from('actions')
        .insert(actions.map(a => ({
          analysis_id: analysisId,
          title: a.title,
          description: a.description,
          priority: a.priority,
          status: 'pending',
        })) as any);
    }

    // Update analysis with enriched summary
    await adminClient
      .from('analyses')
      .update({
        status: 'completed',
        columns: columns as unknown as Json,
        summary: enrichedSummary as unknown as Json,
        row_count: parsedData.length,
        column_count: columns.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);

    return NextResponse.json({
      success: true,
      analysisId,
      summary: enrichedSummary,
      insightsCount: insights.length,
      chartsCount: charts.length,
      actionsCount: actions.length,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

// ── CSV Parsing ─────────────────────────────────────────────

function parseCSV(csvText: string): Record<string, unknown>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        const value = values[index].trim().replace(/"/g, '');
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? value : numValue;
      });
      data.push(row);
    }
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

// ── Column & Summary Analysis ───────────────────────────────

function analyzeColumns(data: Record<string, unknown>[]): ColumnInfo[] {
  if (data.length === 0) return [];

  const firstRow = data[0];
  const columns: ColumnInfo[] = [];

  for (const key of Object.keys(firstRow)) {
    const values = data.map(row => row[key]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');

    let type: 'number' | 'string' | 'date' | 'boolean' = 'string';
    if (nonNullValues.every(v => typeof v === 'number')) {
      type = 'number';
    } else if (nonNullValues.every(v => typeof v === 'boolean')) {
      type = 'boolean';
    }

    const sampleValues = nonNullValues.slice(0, 5).map(v => String(v));
    const uniqueValues = new Set(nonNullValues.map(v => String(v)));

    columns.push({
      name: key,
      type,
      sampleValues,
      nullCount: values.length - nonNullValues.length,
      uniqueCount: uniqueValues.size,
    });
  }

  return columns;
}

function calculateSummary(data: Record<string, unknown>[], columns: ColumnInfo[]): Summary {
  const numericColumns: Summary['numericColumns'] = [];
  const categoricalColumns: Summary['categoricalColumns'] = [];

  for (const col of columns) {
    const values = data.map(row => row[col.name]).filter(v => v !== null && v !== undefined);

    if (col.type === 'number') {
      const numValues = values.map(v => Number(v)).filter(n => !isNaN(n));
      if (numValues.length > 0) {
        const sorted = [...numValues].sort((a, b) => a - b);
        const sum = numValues.reduce((a, b) => a + b, 0);
        const mean = sum / numValues.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const variance = numValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numValues.length;
        const stdDev = Math.sqrt(variance);

        numericColumns.push({
          name: col.name,
          min: Math.min(...numValues),
          max: Math.max(...numValues),
          mean: Math.round(mean * 100) / 100,
          median,
          stdDev: Math.round(stdDev * 100) / 100,
        });
      }
    } else if (col.type === 'string' && col.uniqueCount < data.length * 0.5) {
      const counts: Record<string, number> = {};
      values.forEach(v => {
        const key = String(v);
        counts[key] = (counts[key] || 0) + 1;
      });

      const topValues = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));

      categoricalColumns.push({
        name: col.name,
        topValues,
      });
    }
  }

  return {
    totalRows: data.length,
    totalColumns: columns.length,
    numericColumns,
    categoricalColumns,
  };
}

// ── Chart Generation ────────────────────────────────────────

function buildCharts(
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary,
  aiSuggestions: AIAnalysisResult['chartSuggestions']
): { type: string; title: string; config: unknown; data: unknown }[] {
  const charts: { type: string; title: string; config: unknown; data: unknown }[] = [];

  // Build AI-suggested charts using actual data
  for (const suggestion of aiSuggestions.slice(0, 4)) {
    const chartData = buildChartData(data, columns, summary, suggestion);
    if (chartData) {
      charts.push({
        type: suggestion.type,
        title: suggestion.title,
        config: { xKey: suggestion.xKey, yKey: suggestion.yKey },
        data: chartData,
      });
    }
  }

  // Fallback: auto-generate if AI didn't suggest enough
  if (charts.length < 2) {
    for (const catCol of summary.categoricalColumns.slice(0, 2)) {
      if (!charts.find(c => c.title.includes(catCol.name))) {
        charts.push({
          type: 'bar',
          title: `${catCol.name} 분포`,
          config: { xKey: 'value', yKey: 'count' },
          data: catCol.topValues,
        });
      }
    }
  }

  return charts;
}

function buildChartData(
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary,
  suggestion: AIAnalysisResult['chartSuggestions'][0]
): unknown[] | null {
  const xCol = columns.find(c => c.name === suggestion.xKey);
  const yCol = columns.find(c => c.name === suggestion.yKey);

  if (!xCol) return null;

  // If categorical x-axis: aggregate by category
  if (xCol.type === 'string' && yCol && yCol.type === 'number') {
    const aggregated: Record<string, { sum: number; count: number }> = {};
    for (const row of data) {
      const key = String(row[xCol.name] || '');
      if (!key) continue;
      if (!aggregated[key]) aggregated[key] = { sum: 0, count: 0 };
      const val = Number(row[yCol.name]);
      if (!isNaN(val)) {
        aggregated[key].sum += val;
        aggregated[key].count += 1;
      }
    }
    return Object.entries(aggregated)
      .map(([value, { sum, count }]) => ({
        [suggestion.xKey]: value,
        [suggestion.yKey]: Math.round(sum * 100) / 100,
        count,
      }))
      .sort((a, b) => (b[suggestion.yKey] as number) - (a[suggestion.yKey] as number))
      .slice(0, 10);
  }

  // If just categorical distribution
  if (xCol.type === 'string') {
    const catData = summary.categoricalColumns.find(c => c.name === xCol.name);
    if (catData) {
      return catData.topValues.map(v => ({
        [suggestion.xKey]: v.value,
        [suggestion.yKey || 'count']: v.count,
      }));
    }
  }

  // If both numeric: scatter/line
  if (xCol.type === 'number' && yCol && yCol.type === 'number') {
    return data.slice(0, 50).map(row => ({
      [suggestion.xKey]: row[xCol.name],
      [suggestion.yKey]: row[yCol.name],
    }));
  }

  return null;
}

// ── AI: Comprehensive Analysis ──────────────────────────────

async function generateComprehensiveAnalysis(
  anthropic: Anthropic,
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary,
  role: string = 'team_member',
  customRole: string = ''
): Promise<AIAnalysisResult | null> {
  const rolePrompts: Record<string, string> = {
    team_member: `You are a practical data analyst helping a team member optimize their daily work.

Your analysis should focus on OPERATIONAL insights that a team member can act on immediately:
1. Executive summary: What does this data mean for day-to-day work? (2-3 sentences)
2. KPIs: Focus on operational metrics (처리 건수, 완료율, 소요 시간, 오류율 등)
3. Insights: Find patterns, anomalies, and efficiency opportunities in the data
4. Actions: Suggest specific tasks the team member can do THIS WEEK to improve results
5. Charts: Show trends and distributions that reveal work patterns

Perspective: 실무자 관점 - "내 업무에 바로 활용할 수 있는 것"`,

    team_lead: `You are a team management consultant helping a team leader optimize team performance.

Your analysis should focus on TEAM PERFORMANCE and RESOURCE MANAGEMENT:
1. Executive summary: Team performance overview and key concerns (2-3 sentences)
2. KPIs: Focus on team-level metrics (팀 생산성, 목표 달성률, 리소스 활용률, 병목 구간)
3. Insights: Compare across team members/segments, identify top/bottom performers, find bottlenecks
4. Actions: Suggest team restructuring, resource reallocation, process improvements
5. Charts: Show comparisons, rankings, and progress tracking

Perspective: 팀장 관점 - "팀 성과를 어떻게 끌어올릴 것인가"`,

    executive: `You are a senior management consultant presenting to C-level executives.

Your analysis should focus on STRATEGIC BUSINESS IMPLICATIONS:
1. Executive summary: Business impact and strategic implications (2-3 sentences, board-ready)
2. KPIs: Focus on business-level metrics (매출, 수익률, 시장점유율, 고객 가치, ROI)
3. Insights: Identify market trends, competitive advantages, strategic risks and opportunities
4. Actions: Recommend strategic decisions with projected ROI and timeline
5. Charts: Show big-picture trends, forecasts, and executive dashboards

Perspective: 임원 관점 - "비즈니스 전략적으로 무엇을 결정해야 하는가"`,
  };

  const roleContext = rolePrompts[role] || rolePrompts.team_member;

  const customRoleContext = customRole
    ? `\n\nUser's specific role: "${customRole}"
This user identifies as "${customRole}". Tailor your analysis specifically to this role:
- Use terminology, KPIs, and metrics that are most relevant to "${customRole}"
- Frame insights in the context of what someone in "${customRole}" would care about
- Suggest actions that are directly actionable for someone in this specific role
- If the role implies a specific domain (e.g., "퍼포먼스 마케팅" → ROAS, CPA, CTR; "B2B 영업" → 파이프라인, 계약 규모, 리드 전환율), prioritize those domain-specific metrics`
    : '';

  const systemPrompt = `${roleContext}${customRoleContext}

Guidelines:
- All text content must be in Korean
- Use specific numbers, percentages, and comparisons
- Focus on "so what?" - every insight must lead to a business implication
- Actions must be concrete enough to assign to someone
- Return ONLY valid JSON, no markdown`;

  const userPrompt = `
## Dataset: ${summary.totalRows} rows, ${summary.totalColumns} columns

## Columns
${columns.map(c => `- ${c.name} (${c.type}, ${c.uniqueCount} unique values, samples: ${c.sampleValues.slice(0, 3).join(', ')})`).join('\n')}

## Numeric Statistics
${summary.numericColumns.map(c => `- ${c.name}: avg=${c.mean}, min=${c.min}, max=${c.max}, median=${c.median}, stddev=${c.stdDev}`).join('\n')}

## Categorical Distributions
${summary.categoricalColumns.map(c => `- ${c.name}: ${c.topValues.map(v => `${v.value}(${v.count})`).join(', ')}`).join('\n')}

## Sample Data (first 5 rows)
${JSON.stringify(data.slice(0, 5), null, 2)}

## Required Output (JSON)
Return a single JSON object with this structure:
{
  "executiveSummary": "2-3 sentence summary of the most important findings in Korean",
  "businessKPIs": [
    {
      "label": "KPI name in Korean (e.g. 총 매출, 평균 주문액)",
      "value": "formatted value (e.g. 8,450,000원, 84.5%)",
      "change": "contextual note (e.g. 최고 카테고리: 아우터)",
      "changeType": "positive|negative|neutral"
    }
  ],
  "insights": [
    {
      "type": "trend|anomaly|pattern|comparison|summary",
      "title": "Korean title (max 50 chars)",
      "description": "2-3 sentences in Korean with specific numbers and business implications",
      "importance": "critical|high|medium|low",
      "data": { "relevant": "metrics" }
    }
  ],
  "actions": [
    {
      "title": "Specific action in Korean (max 50 chars)",
      "description": "What to do, expected impact, and how to measure success (2-3 sentences in Korean)",
      "priority": "urgent|high|medium|low"
    }
  ],
  "chartSuggestions": [
    {
      "type": "bar|line|pie",
      "title": "Chart title in Korean",
      "xKey": "actual column name from data",
      "yKey": "actual column name from data",
      "description": "Why this chart is informative"
    }
  ]
}

Requirements:
- businessKPIs: exactly 4 items, the most business-critical metrics from THIS data
- insights: 4-6 items, ordered by importance
- actions: 3-5 items, specific and measurable
- chartSuggestions: 2-4 items, using actual column names from the data`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    // Extract JSON object
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

    // Validate required fields
    if (!result.executiveSummary || !result.businessKPIs || !result.insights) {
      throw new Error('Incomplete AI response');
    }

    return result;
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

// ── Fallbacks ───────────────────────────────────────────────

function generateBasicInsights(summary: Summary): AIAnalysisResult['insights'] {
  const insights: AIAnalysisResult['insights'] = [];

  insights.push({
    type: 'summary',
    title: '데이터 요약',
    description: `총 ${summary.totalRows}개의 행과 ${summary.totalColumns}개의 열이 분석되었습니다.`,
    importance: 'medium',
    data: { rows: summary.totalRows, columns: summary.totalColumns },
  });

  for (const numCol of summary.numericColumns.slice(0, 2)) {
    insights.push({
      type: 'pattern',
      title: `${numCol.name} 분석`,
      description: `${numCol.name}의 평균값은 ${numCol.mean}이며, 최소 ${numCol.min}에서 최대 ${numCol.max} 범위입니다.`,
      importance: 'medium',
      data: numCol,
    });
  }

  return insights;
}

function generateBasicActions(
  insights: AIAnalysisResult['insights']
): AIAnalysisResult['actions'] {
  const actions: AIAnalysisResult['actions'] = [];

  for (const insight of insights) {
    if (insight.importance === 'critical' || insight.importance === 'high') {
      actions.push({
        title: `${insight.title} 검토`,
        description: `"${insight.title}"에 대한 상세 검토가 필요합니다.`,
        priority: insight.importance === 'critical' ? 'urgent' : 'high',
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      title: '분석 결과 검토',
      description: '분석 결과를 검토하고 추가 조치를 확인하세요.',
      priority: 'medium',
    });
  }

  return actions;
}
