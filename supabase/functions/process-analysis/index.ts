import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.16.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { analysisId } = await req.json();

    if (!analysisId) {
      throw new Error('Analysis ID is required');
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // Get analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      throw new Error('Analysis not found');
    }

    // Update status to processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // Download and parse file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(analysis.file_url);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Parse the file based on type
    let parsedData: Record<string, unknown>[] = [];
    const fileText = await fileData.text();

    if (analysis.file_type === 'csv') {
      parsedData = parseCSV(fileText);
    } else {
      // For Excel files, we'd need a different approach
      // For now, return an error for non-CSV files
      throw new Error('Excel parsing not yet implemented in Edge Functions');
    }

    if (parsedData.length === 0) {
      throw new Error('No data found in file');
    }

    // Analyze data structure
    const columns = analyzeColumns(parsedData);
    const summary = calculateSummary(parsedData, columns);

    // Generate charts configuration
    const charts = generateCharts(parsedData, columns, summary);

    // Generate AI insights using Claude
    const insights = await generateAIInsights(anthropic, parsedData, columns, summary);

    // Generate action recommendations
    const actions = generateActions(insights);

    // Save results to database
    // Save insights
    if (insights.length > 0) {
      const { error: insightError } = await supabase
        .from('insights')
        .insert(insights.map(i => ({
          analysis_id: analysisId,
          type: i.type,
          title: i.title,
          description: i.description,
          importance: i.importance,
          data: i.data,
        })));

      if (insightError) console.error('Error saving insights:', insightError);
    }

    // Save charts
    if (charts.length > 0) {
      const { error: chartError } = await supabase
        .from('charts')
        .insert(charts.map((c, index) => ({
          analysis_id: analysisId,
          type: c.type,
          title: c.title,
          config: c.config,
          data: c.data,
          position: index,
        })));

      if (chartError) console.error('Error saving charts:', chartError);
    }

    // Save actions
    if (actions.length > 0) {
      const { error: actionError } = await supabase
        .from('actions')
        .insert(actions.map(a => ({
          analysis_id: analysisId,
          title: a.title,
          description: a.description,
          priority: a.priority,
          status: 'pending',
        })));

      if (actionError) console.error('Error saving actions:', actionError);
    }

    // Update analysis with results
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

    return new Response(
      JSON.stringify({ success: true, analysisId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Processing error:', error);

    // Update analysis status to failed if we have analysisId
    try {
      const { analysisId } = await req.json();
      if (analysisId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await supabase
          .from('analyses')
          .update({ status: 'failed' })
          .eq('id', analysisId);
      }
    } catch (_) {}

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Parse CSV data
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
        // Try to parse as number
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? value : numValue;
      });
      data.push(row);
    }
  }

  return data;
}

// Parse a single CSV line (handling quoted values)
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

// Analyze column types and statistics
function analyzeColumns(data: Record<string, unknown>[]): ColumnInfo[] {
  if (data.length === 0) return [];

  const firstRow = data[0];
  const columns: ColumnInfo[] = [];

  for (const key of Object.keys(firstRow)) {
    const values = data.map(row => row[key]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');

    // Determine type
    let type: 'number' | 'string' | 'date' | 'boolean' = 'string';
    if (nonNullValues.every(v => typeof v === 'number')) {
      type = 'number';
    } else if (nonNullValues.every(v => typeof v === 'boolean')) {
      type = 'boolean';
    } else if (nonNullValues.every(v => !isNaN(Date.parse(String(v))))) {
      type = 'date';
    }

    // Get sample values
    const sampleValues = nonNullValues
      .slice(0, 5)
      .map(v => String(v));

    // Count unique values
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

// Calculate summary statistics
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
      // Categorical if unique values are less than 50% of total
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

// Generate chart configurations
function generateCharts(
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary
): { type: string; title: string; config: unknown; data: unknown }[] {
  const charts: { type: string; title: string; config: unknown; data: unknown }[] = [];

  // KPI cards for numeric columns
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

  // Bar chart for categorical columns
  for (const catCol of summary.categoricalColumns.slice(0, 2)) {
    charts.push({
      type: 'bar',
      title: `${catCol.name} 분포`,
      config: { xKey: 'value', yKey: 'count' },
      data: catCol.topValues,
    });
  }

  // Line chart if there's a date column and numeric column
  const dateCol = columns.find(c => c.type === 'date');
  const numCol = summary.numericColumns[0];
  if (dateCol && numCol) {
    const chartData = data
      .slice(0, 50)
      .map(row => ({
        date: String(row[dateCol.name]),
        value: Number(row[numCol.name]) || 0,
      }));

    charts.push({
      type: 'line',
      title: `${numCol.name} 추이`,
      config: { xKey: 'date', yKey: 'value' },
      data: chartData,
    });
  }

  return charts;
}

// Generate AI insights using Claude
async function generateAIInsights(
  anthropic: Anthropic,
  data: Record<string, unknown>[],
  columns: ColumnInfo[],
  summary: Summary
): Promise<{ type: string; title: string; description: string; importance: string; data: unknown }[]> {
  const systemPrompt = `You are a business data analyst expert. Analyze the provided data summary and generate actionable business insights.
Guidelines:
1. Focus on business-relevant findings
2. Identify trends, anomalies, and patterns
3. Provide specific numbers and percentages
4. Rank insights by business impact
5. Use clear, non-technical language
6. Respond in Korean
7. Return ONLY valid JSON array, no markdown formatting`;

  const userPrompt = `
## Data Summary
- Total Rows: ${summary.totalRows}
- Total Columns: ${summary.totalColumns}

## Numeric Columns
${JSON.stringify(summary.numericColumns, null, 2)}

## Categorical Columns
${JSON.stringify(summary.categoricalColumns, null, 2)}

## Column Information
${JSON.stringify(columns, null, 2)}

## Sample Data (first 5 rows)
${JSON.stringify(data.slice(0, 5), null, 2)}

## Task
Generate 3-5 key business insights as a JSON array. Each insight should have:
- type: "trend" | "anomaly" | "pattern" | "comparison" | "summary"
- title: Brief title (max 50 chars)
- description: Detailed explanation (2-3 sentences in Korean)
- importance: "critical" | "high" | "medium" | "low"
- data: Related metrics object

Return ONLY the JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const insights = JSON.parse(jsonMatch[0]);
    return insights;
  } catch (error) {
    console.error('AI insight generation error:', error);
    // Return default insights on error
    return [{
      type: 'summary',
      title: '데이터 요약',
      description: `총 ${summary.totalRows}개의 행과 ${summary.totalColumns}개의 열이 분석되었습니다.`,
      importance: 'medium',
      data: { rows: summary.totalRows, columns: summary.totalColumns },
    }];
  }
}

// Generate action recommendations based on insights
function generateActions(
  insights: { type: string; title: string; description: string; importance: string; data: unknown }[]
): { title: string; description: string; priority: string }[] {
  const actions: { title: string; description: string; priority: string }[] = [];

  for (const insight of insights) {
    if (insight.importance === 'critical' || insight.importance === 'high') {
      actions.push({
        title: `${insight.title} 검토`,
        description: `인사이트: "${insight.title}"에 대한 상세 검토 및 대응 전략 수립이 필요합니다.`,
        priority: insight.importance === 'critical' ? 'urgent' : 'high',
      });
    }
  }

  // Add default action if none generated
  if (actions.length === 0) {
    actions.push({
      title: '데이터 분석 결과 검토',
      description: '분석 결과를 검토하고 추가 분석이 필요한 영역을 확인하세요.',
      priority: 'medium',
    });
  }

  return actions;
}
