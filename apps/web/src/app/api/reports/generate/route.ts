import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getPlanLimits } from '@/lib/plan-limits';
import React from 'react';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user's plan supports PDF export
    const adminSupabaseForPlan = getAdminSupabase();
    const { data: profile } = await adminSupabaseForPlan
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const limits = getPlanLimits(profile?.plan || 'free');
    if (!limits.pdfExport) {
      return NextResponse.json(
        { error: 'PDF 리포트 내보내기는 Pro 플랜 이상에서 사용할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Get report with analysis data
    const { data: report, error: reportError } = await adminSupabase
      .from('reports')
      .select(`
        *,
        analyses(
          *,
          insights(*),
          charts(*),
          actions(*)
        )
      `)
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const analysis = report.analyses as any;

    // Prepare report data
    const reportData = {
      name: report.name,
      template: report.template,
      createdAt: report.created_at,
      analysis: {
        name: analysis?.name || 'Unknown',
        rowCount: analysis?.row_count || 0,
        columnCount: analysis?.column_count || 0,
        summary: analysis?.summary || {},
      },
      insights: (analysis?.insights || []).map((i: any) => ({
        type: i.type,
        title: i.title,
        description: i.description,
        importance: i.importance,
      })),
      actions: (analysis?.actions || []).map((a: any) => ({
        title: a.title,
        description: a.description,
        priority: a.priority,
        status: a.status,
      })),
    };

    // Dynamic import to avoid bundling issues
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { ReportDocument } = await import('@/lib/pdf/report-template');

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, { data: reportData })
    );

    // Upload PDF to Supabase Storage
    const fileName = `${user.id}/${reportId}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    }

    // Get public URL for the PDF
    let pdfUrl = null;
    if (uploadData) {
      const { data: urlData } = adminSupabase.storage
        .from('reports')
        .getPublicUrl(fileName);
      pdfUrl = urlData.publicUrl;
    }

    // Update report with PDF URL
    await adminSupabase
      .from('reports')
      .update({
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    return NextResponse.json({
      success: true,
      reportId,
      pdfUrl,
      message: 'Report generated successfully',
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Report generation failed' },
      { status: 500 }
    );
  }
}

// Download endpoint for direct PDF download
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check plan access
    const adminSupabaseCheck = getAdminSupabase();
    const { data: dlProfile } = await adminSupabaseCheck
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const dlLimits = getPlanLimits(dlProfile?.plan || 'free');
    if (!dlLimits.pdfExport) {
      return NextResponse.json(
        { error: 'PDF 리포트 내보내기는 Pro 플랜 이상에서 사용할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Get report with analysis data
    const { data: report, error: reportError } = await adminSupabase
      .from('reports')
      .select(`
        *,
        analyses(
          *,
          insights(*),
          charts(*),
          actions(*)
        )
      `)
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const analysis = report.analyses as any;

    // Prepare report data
    const reportData = {
      name: report.name,
      template: report.template,
      createdAt: report.created_at,
      analysis: {
        name: analysis?.name || 'Unknown',
        rowCount: analysis?.row_count || 0,
        columnCount: analysis?.column_count || 0,
        summary: analysis?.summary || {},
      },
      insights: (analysis?.insights || []).map((i: any) => ({
        type: i.type,
        title: i.title,
        description: i.description,
        importance: i.importance,
      })),
      actions: (analysis?.actions || []).map((a: any) => ({
        title: a.title,
        description: a.description,
        priority: a.priority,
        status: a.status,
      })),
    };

    // Dynamic import to avoid bundling issues
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { ReportDocument } = await import('@/lib/pdf/report-template');

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, { data: reportData })
    );

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(report.name as string)}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF download failed' },
      { status: 500 }
    );
  }
}
