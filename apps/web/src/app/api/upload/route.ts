import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getPlanLimits } from '@/lib/plan-limits';

const ALLOWED_TYPES = ['csv', 'xls', 'xlsx'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for plan info (use admin client to bypass RLS)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan || 'free';
    const limits = getPlanLimits(plan);

    // Check monthly analysis count for plans with limits
    if (limits.monthlyAnalyses > 0) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count } = await adminClient
        .from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth);

      if ((count || 0) >= limits.monthlyAnalyses) {
        return NextResponse.json(
          { error: `월 ${limits.monthlyAnalyses}회 무료 분석 한도를 초과했습니다. Pro 플랜으로 업그레이드하시면 무제한으로 분석할 수 있습니다.` },
          { status: 429 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspaceId') as string | null;
    const role = (formData.get('role') as string) || 'team_member';
    const customRole = (formData.get('customRole') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_TYPES.includes(extension)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > limits.maxFileSize) {
      return NextResponse.json(
        { error: `파일이 너무 큽니다. 최대 크기: ${limits.maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Sanitize filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage (use admin client to bypass RLS)
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Create analysis record (use admin client to bypass RLS)
    const roleLabels: Record<string, string> = {
      team_member: '팀원',
      team_lead: '팀장',
      executive: '임원',
    };
    const { data: analysis, error: analysisError } = await adminClient
      .from('analyses')
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        name: file.name,
        description: `role:${role}|customRole:${customRole}|${customRole || roleLabels[role] || '팀원'} 관점 분석`,
        file_name: file.name,
        file_url: uploadData.path,
        file_size: file.size,
        file_type: extension as 'csv' | 'xls' | 'xlsx',
        status: 'pending',
      } as any)
      .select()
      .single();

    if (analysisError) {
      console.error('Analysis creation error:', analysisError);
      // Clean up uploaded file
      await adminClient.storage.from('uploads').remove([uploadData.path]);
      return NextResponse.json(
        { error: 'Failed to create analysis record' },
        { status: 500 }
      );
    }

    // Skip Edge Function in local dev - analysis is triggered by client via /api/analyze

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
