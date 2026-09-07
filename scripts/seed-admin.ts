/**
 * Seed / Reset Admin User
 * Usage: npm run db:seed
 *
 * Creates or updates the admin user with the password from ADMIN_PASSWORD env var.
 * Safe to run multiple times.
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ ERROR: ADMIN_PASSWORD environment variable is missing. Refusing to use weak default password in production.');
      process.exit(1);
    }
    console.warn('⚠️ WARNING: ADMIN_PASSWORD is not set. Falling back to default weak password in development.');
    password = 'Doctor@2024';
  }
  const doctorName = process.env.NEXT_PUBLIC_DOCTOR_NAME || 'Dr. Snehal Korade';
  const hash = bcrypt.hashSync(password, 12);

  console.log('\n🔐  Seeding admin user...');

  try {
    await client.query(`
      INSERT INTO admin_user (username, password_hash, display_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            display_name  = EXCLUDED.display_name
    `, ['admin', hash, doctorName]);

    console.log(`  ✅  Admin user set. Username: admin`);
    if (password === 'Doctor@2024') {
      console.log(`  ⚠️   Using default password 'Doctor@2024'. Set ADMIN_PASSWORD env var before production!`);
    } else {
      console.log(`  ✅  Custom password applied.`);
    }
    console.log();
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
