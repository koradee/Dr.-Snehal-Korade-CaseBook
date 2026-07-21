import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated via custom auth
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const path = searchParams.get('path');

    if (!bucket || !path) {
      return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 });
    }

    if (bucket !== 'documents' && bucket !== 'clinical-images') {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    // Generate a temporary signed URL (valid for 60 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 60);

    if (error || !data) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json({ error: 'Failed to access file' }, { status: 404 });
    }

    // Redirect the user directly to the signed Supabase URL
    // This offloads the file downloading bandwidth to Supabase directly
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error('[files] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
