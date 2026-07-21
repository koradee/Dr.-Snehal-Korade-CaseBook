/**
 * CLI Migration Runner
 * Usage: npm run migrate
 *
 * Reads all .sql files in /migrations, applies them in order,
 * and tracks applied versions in schema_migrations table.
 */

import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL environment variable is not set.');
  console.error('   Copy .env.local.example to .env.local and configure it.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const ROOT = resolve(process.cwd());
const MIGRATIONS_DIR = join(ROOT, 'migrations');

async function run() {
  const client = await pool.connect();
  console.log('\n🩺  Dr. Snehal Korade CaseBook — Database Migration Runner\n');

  try {
    // Create schema_migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      // Check if already applied
      const { rows } = await client.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`  ⏭  ${file} — already applied`);
        skipped++;
        continue;
      }

      const filePath = join(MIGRATIONS_DIR, file);
      let sql = readFileSync(filePath, 'utf-8');

      // Special handling for admin_user seed migration
      if (file === '008_admin_user.sql') {
        // Strip comments from the SQL (comments already explain the seeding)
        const cleanSql = sql
          .split('\n')
          .filter((line) => !line.trim().startsWith('--'))
          .join('\n')
          .trim();

        await client.query('BEGIN');
        try {
          if (cleanSql) await client.query(cleanSql);
          await client.query(
            'INSERT INTO schema_migrations (version) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        }

        // Seed admin user
        const { rows: existing } = await client.query(
          'SELECT id FROM admin_user WHERE username = $1',
          ['admin']
        );

        if (existing.length === 0) {
          const password = process.env.ADMIN_PASSWORD || 'Doctor@2024';
          const hash = bcrypt.hashSync(password, 12);
          const doctorName = process.env.NEXT_PUBLIC_DOCTOR_NAME || 'Dr. Snehal Korade';
          await client.query(
            `INSERT INTO admin_user (username, password_hash, display_name)
             VALUES ($1, $2, $3)`,
            ['admin', hash, doctorName]
          );
          console.log(`  ✅  ${file} — applied`);
          console.log(`       Admin user seeded. Username: admin`);
          if (password === 'Doctor@2024') {
            console.log(`  ⚠️   Using default password 'Doctor@2024'. Change via ADMIN_PASSWORD env var!`);
          }
        } else {
          console.log(`  ✅  ${file} — applied (admin user already exists)`);
        }
        applied++;
        continue;
      }

      // Standard migration
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✅  ${file} — applied`);
        applied++;
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`  ❌  ${file} — FAILED`);
        throw e;
      }
    }

    console.log(`\n✔  Done: ${applied} applied, ${skipped} skipped.\n`);
  } catch (err) {
    console.error('\n❌  Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
