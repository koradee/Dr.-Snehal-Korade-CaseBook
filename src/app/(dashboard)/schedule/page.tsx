import React from 'react';
import { query } from '@/lib/db';
import { ScheduleClient } from './ScheduleClient';

export const metadata = {
  title: 'Schedule',
};

async function getUpcomingFollowUps() {
  return await query(`
    SELECT c.id, c.follow_up_date, c.follow_up_time, c.diagnosis, p.id as patient_id, p.full_name as patient_name
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    WHERE c.follow_up_date IS NOT NULL
      AND c.follow_up_date >= CURRENT_DATE
    ORDER BY c.follow_up_date ASC, c.follow_up_time ASC
  `);
}

export default async function SchedulePage() {
  const followUps = await getUpcomingFollowUps();

  // Convert followUps to JSON-safe objects before passing to Client Component
  // Postgres dates might come back as Date objects depending on pg setup.
  const serializedFollowUps = followUps.map((item: any) => ({
    id: String(item.id),
    follow_up_date: item.follow_up_date instanceof Date 
      ? item.follow_up_date.toISOString() 
      : String(item.follow_up_date),
    follow_up_time: item.follow_up_time ? String(item.follow_up_time) : null,
    diagnosis: item.diagnosis ? String(item.diagnosis) : null,
    patient_id: String(item.patient_id),
    patient_name: String(item.patient_name),
  }));

  return <ScheduleClient initialFollowUps={serializedFollowUps} />;
}
