import React from 'react';
import { query } from '@/lib/db';
import { PatientsClient } from './PatientsClient';

export const metadata = {
  title: 'All Patients',
};

async function getPatients() {
  return await query(`
    SELECT id, full_name, phone, created_at, dob, gender, photo_url, is_archived
    FROM patients
    ORDER BY created_at DESC
  `);
}

export default async function PatientsPage() {
  const patients = await getPatients();

  // Convert to JSON safe formats
  const serialized = patients.map((p: any) => ({
    id: String(p.id),
    full_name: String(p.full_name),
    phone: p.phone ? String(p.phone) : null,
    created_at: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
    dob: p.dob ? String(p.dob) : null,
    gender: p.gender ? String(p.gender) : null,
    photo_url: p.photo_url ? String(p.photo_url) : null,
    is_archived: Boolean(p.is_archived),
  }));

  return <PatientsClient initialPatients={serialized} />;
}
