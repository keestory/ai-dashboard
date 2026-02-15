import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Plan-based file size limits
const PLAN_LIMITS: Record<string, number> = {
  free: 5 * 1024 * 1024,       // 5MB
  pro: 50 * 1024 * 1024,       // 50MB
  team: 100 * 1024 * 1024,     // 100MB
  business: 500 * 1024 * 1024, // 500MB
};

const ALLOWED_TYPES = ['csv', 'xls', 'xlsx'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for plan info
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan || 'free';
    const maxSize = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspaceId') as string | null;

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
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Sanitize filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
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

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        name: file.name,
        file_name: file.name,
        file_url: uploadData.path,
        file_size: file.size,
        file_type: extension as 'csv' | 'xls' | 'xlsx',
        status: 'pending',
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Analysis creation error:', analysisError);
      // Clean up uploaded file
      await supabase.storage.from('uploads').remove([uploadData.path]);
      return NextResponse.json(
        { error: 'Failed to create analysis record' },
        { status: 500 }
      );
    }

    // Trigger analysis processing (Edge Function)
    // Note: In production, this would call a Supabase Edge Function
    try {
      await supabase.functions.invoke('process-analysis', {
        body: { analysisId: analysis.id },
      });
    } catch (funcError) {
      // Edge function might not be deployed yet, continue anyway
      console.log('Edge function not available, analysis will be processed manually');
    }

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
