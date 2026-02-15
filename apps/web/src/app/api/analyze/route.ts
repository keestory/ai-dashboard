import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

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
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    // Get analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Update status to processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(analysis.file_url);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Parse CSV
    const fileText = await fileData.text();
    const parsedData = parseCSV(fileText);

    if (parsedData.length === 0) {
      throw new Error('No data found in file');
    }

    // Analyze data
    const columns = analyzeColumns(parsedData);
    const summary = calculateSummary(parsedData, columns);

    // Generate charts
    const charts = generateCharts(parsedData, columns, summary);

    // Generate AI insights
    let insights: { type: string; title: string; description: string; importance: string; data: unknown }[] = [];

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      insights = await generateAIInsights(anthropic, parsedData, columns, summary);
    } else {
      // Generate basic insights without AI
      insights = generateBasicInsights(summary);
    }

    // Generate actions
    const actions = generateActions(insights);

    // Save results
    if (insights.length > 0) {
      await supabase
        .from('insights')
        .insert(insights.map(i => ({
          analysis_id: analysisId,
          type: i.type,
          title: i.title,
          description: i.description,
          importance: i.importance,
          data: i.data,
        })));
    }

    if (charts.length > 0) {
      await supabase
        .from('charts')
        .insert(charts.map((c, index) => ({
          analysis_id: analysisId,
          type: c.type,
          title: c.title,
          config: c.config,
          data: c.data,
          position: index,
        })));
    }

    if (actions.length > 0) {
      await supabase
        .from('actions')
        .insert(actions.map(a => ({
          analysis_id: analysisId,
          title: a.title,
          description: a.description,
          priority: a.priority,
          status: 'pending',
        })));
    }

    // Update analysis
    await supabase
      .from('analyses')
      .update({
        status: 'completed',
        columns: columns,
        summary: summary,
        row_count: parsedData.length,
        column_count: columns.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);

    return NextResponse.json({
      success: true,
      analysisId,
      summary,
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

function generateCharts(
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary
): { type: string; title: string; config: unknown; data: unknown }[] {
  const charts: { type: string; title: string; config: unknown; data: unknown }[] = [];

  // KPI cards
  for (const numCol of summary.numericColumns.slice(0, 4)) {
    charts.push({
      type: 'kpi',
      title: numCol.name,
      config: { format: 'number' },
      data: {
        value: numCol.mean,
        min: numCol.min,
        max: numCol.max,
      },
    });
  }

  // Bar charts
  for (const catCol of summary.categoricalColumns.slice(0, 2)) {
    charts.push({
      type: 'bar',
      title: `${catCol.name} 분포`,
      config: { xKey: 'value', yKey: 'count' },
      data: catCol.topValues,
    });
  }

  return charts;
}

async function generateAIInsights(
  anthropic: Anthropic,
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary
): Promise<{ type: string; title: string; description: string; importance: string; data: unknown }[]> {
  const systemPrompt = `You are a business data analyst. Analyze data and generate insights in Korean. Return ONLY valid JSON array.`;

  const userPrompt = `
Data Summary:
- Rows: ${summary.totalRows}, Columns: ${summary.totalColumns}
- Numeric: ${JSON.stringify(summary.numericColumns)}
- Categorical: ${JSON.stringify(summary.categoricalColumns)}

Generate 3-5 insights as JSON array:
[{"type":"trend|anomaly|pattern|comparison|summary","title":"제목","description":"설명","importance":"critical|high|medium|low","data":{}}]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON found');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI error:', error);
    return generateBasicInsights(summary);
  }
}

function generateBasicInsights(summary: Summary): { type: string; title: string; description: string; importance: string; data: unknown }[] {
  const insights: { type: string; title: string; description: string; importance: string; data: unknown }[] = [];

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

function generateActions(
  insights: { type: string; title: string; description: string; importance: string; data: unknown }[]
): { title: string; description: string; priority: string }[] {
  const actions: { title: string; description: string; priority: string }[] = [];

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
