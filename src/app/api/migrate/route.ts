/**
 * Migration runner — Development API route
 * POST /api/migrate — runs all pending SQL migrations
 *
 * Only accessible in development mode.
 * Also handles seeding the admin user with the configured password hash.
 */
import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pool, { query, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

interface MigrationRow {
  version: string;
}

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const client = await pool.connect();
  const results: { version: string; status: string }[] = [];

  try {
    // Ensure the migrations tracking table exists first
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Load all migration files, sorted
    const migrationsDir = join(process.cwd(), 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      // Skip if already applied
      const applied = await queryOne<MigrationRow>(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [file]
      );
      if (applied) {
        results.push({ version: file, status: 'skipped (already applied)' });
        continue;
      }

      // Skip 008 special handling — done separately
      if (file === '008_admin_user.sql') {
        // We still run the SQL (creates table + schema_migrations)
        const sql = readFileSync(join(migrationsDir, file), 'utf-8');
        // Run comment-stripped version (skip any INSERT that references hash)
        const cleanSql = sql
          .split('\n')
          .filter((line) => !line.trim().startsWith('--'))
          .join('\n');

        await client.query('BEGIN');
        try {
          await client.query(cleanSql);
          await client.query(
            'INSERT INTO schema_migrations (version) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        }

        // Seed admin user if not already present
        const existingUser = await queryOne(
          'SELECT id FROM admin_user WHERE username = $1',
          ['admin']
        );
        if (!existingUser) {
          let defaultPassword = process.env.ADMIN_PASSWORD;
          if (!defaultPassword) {
            console.warn('⚠️ WARNING: ADMIN_PASSWORD is not set. Falling back to default weak password in development.');
            defaultPassword = 'Doctor@2024';
          }
          const passwordHash = await hashPassword(defaultPassword);
          await query(
            `INSERT INTO admin_user (username, password_hash, display_name)
             VALUES ($1, $2, $3)
             ON CONFLICT (username) DO NOTHING`,
            ['admin', passwordHash, process.env.NEXT_PUBLIC_DOCTOR_NAME || 'Dr. Snehal Korade']
          );
          console.log('[migrate] Admin user seeded with default password.');
        }

        results.push({ version: file, status: 'applied' });
        continue;
      }

      // Run standard migration in a transaction
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        results.push({ version: file, status: 'applied' });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error('[migrate] Error:', err);
    return NextResponse.json(
      { error: String(err), results },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const applied = await query<MigrationRow>(
      'SELECT version, applied_at FROM schema_migrations ORDER BY version'
    ).catch(() => []);
    return NextResponse.json({ applied });
  } catch {
    return NextResponse.json({ applied: [] });
  }
}
