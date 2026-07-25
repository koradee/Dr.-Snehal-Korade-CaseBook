import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import path from 'path';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const patientId = formData.get('patientId') as string;

    if (!file || !type || !patientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['photos', 'documents', 'clinical-images'].includes(type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Determine the appropriate Supabase bucket based on the file type
    const bucketName = type === 'documents' ? 'documents' : 'clinical-images';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create unique filename and path structure: {patientId}/{type}/{filename}
    const ext = path.extname(file.name);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = `${patientId}/${type}/${uniqueName}`;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Missing Supabase Configuration', 
        details: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. Please configure them in .env.local'
      }, { status: 500 });
    }

    // Upload to private Supabase bucket using Service Role Key
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Supabase Storage Error', 
        details: uploadError.message || JSON.stringify(uploadError)
      }, { status: 500 });
    }

    // Return an internal API URL that will dynamically generate signed URLs for viewing
    const publicUrl = `/api/files?bucket=${bucketName}&path=${encodeURIComponent(filePath)}`;

    return NextResponse.json({ publicUrl });
  } catch (error: any) {
    console.error('[upload] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file to Supabase',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
