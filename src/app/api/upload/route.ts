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
      return NextResponse.json({ error: 'Invalid file category' }, { status: 400 });
    }

    // File size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must not exceed 10MB' }, { status: 400 });
    }

    // Determine the appropriate Supabase bucket based on the file type
    const bucketName = type === 'documents' ? 'documents' : 'clinical-images';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate MIME type using magic numbers (file signature)
    let actualMimeType = '';
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      actualMimeType = 'image/jpeg';
    } else if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a) {
      actualMimeType = 'image/png';
    } else if (buffer.length >= 5 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2d) {
      actualMimeType = 'application/pdf';
    }

    if (!actualMimeType) {
      return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and PDF files are allowed.' }, { status: 400 });
    }

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
