import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Get analysis with related data
    const { data: analysis, error } = await adminSupabase
      .from('analyses')
      .select(`
        id,
        name,
        description,
        file_name,
        file_size,
        status,
        row_count,
        column_count,
        summary,
        created_at,
        completed_at,
        insights(id, type, title, description, importance, data),
        charts(id, type, title, config, data, position),
        actions(id, title, description, priority, status)
      `)
      .eq('id', analysisId)
      .eq('status', 'completed')
      .single();

    if (error || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Strip sensitive fields (user_id, workspace_id, file_url)
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load analysis' },
      { status: 500 }
    );
  }
}
