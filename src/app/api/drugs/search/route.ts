import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ drugs: [] });
    }

    // Fuzzy search using ILIKE
    // The drug_library has a text_pattern_ops index on drug_name which helps with LIKE 'prefix%' 
    // but we can just use ILIKE for a simple fuzzy match for now.
    const drugs = await query(`
      SELECT drug_name, default_dosage, default_frequency
      FROM drug_library
      WHERE drug_name ILIKE $1
      ORDER BY drug_name ASC
      LIMIT 10
    `, [`%${q}%`]);

    return NextResponse.json({ drugs: drugs || [] });
  } catch (error) {
    console.error('[drugs/search/GET] Error:', error);
    return NextResponse.json({ error: 'Failed to search drugs' }, { status: 500 });
  }
}
