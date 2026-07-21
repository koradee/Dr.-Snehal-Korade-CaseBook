import type { Metadata } from 'next';
import Link from 'next/link';
import { query, queryOne } from '@/lib/db';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  UserCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getInitials, getAvatarColor } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dashboard',
};

interface FollowUp {
  id: string; // consultation id
  patient_id: string;
  full_name: string;
  photo_url: string | null;
  gender: string | null;
  dob: string | null;
  diagnosis: string | null;
  advice: string | null;
  follow_up_time: string | null;
}

interface RecentPatient {
  id: string;
  full_name: string;
  photo_url: string | null;
  gender: string | null;
  phone: string | null;
  updated_at: string;
  tags?: string[];
}

export default async function DashboardPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Get today's follow-ups
  const followUps = await query<FollowUp>(`
    SELECT 
      c.id, c.patient_id, p.full_name, p.photo_url, p.gender, p.dob, 
      c.diagnosis, c.advice, c.follow_up_time
    FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    WHERE c.follow_up_date = $1 AND p.is_archived = false
    ORDER BY c.follow_up_time ASC NULLS LAST, c.created_at ASC
  `, [todayStr]);

  // Get recently updated patients
  const recentPatients = await query<RecentPatient>(`
    SELECT p.id, p.full_name, p.photo_url, p.gender, p.phone, p.updated_at,
           (SELECT COALESCE(json_agg(tag_name), '[]') FROM patient_tags WHERE patient_id = p.id) as tags
    FROM patients p
    WHERE p.is_archived = false
    ORDER BY p.updated_at DESC
    LIMIT 10
  `);

  // Dashboard Stats
  const { count: totalPatients } = await queryOne<{ count: string }>(`SELECT COUNT(*) FROM patients WHERE is_archived = false`) || { count: '0' };
  
  const { count: weekFollowUps } = await queryOne<{ count: string }>(`
    SELECT COUNT(*) FROM consultations 
    WHERE follow_up_date >= CURRENT_DATE 
      AND follow_up_date <= CURRENT_DATE + interval '7 days'
  `) || { count: '0' };
  
  const { count: newPatientsMonth } = await queryOne<{ count: string }>(`
    SELECT COUNT(*) FROM patients 
    WHERE is_archived = false AND created_at >= date_trunc('month', CURRENT_DATE)
  `) || { count: '0' };

  const todayDisplay = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ padding: '2.5rem 1.75rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            Good morning, Doctor 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{todayDisplay}</p>
        </div>
        <Link href="/patients/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlusIcon width={20} height={20} />
          Add Patient
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
            <UserGroupIcon width={24} height={24} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Patients</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{totalPatients}</p>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '12px' }}>
            <CalendarDaysIcon width={24} height={24} style={{ color: '#14b8a6' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Today's Follow-ups</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{followUps.length}</p>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
            <ClockIcon width={24} height={24} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>This Week</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{weekFollowUps}</p>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
            <ChartBarIcon width={24} height={24} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>New This Month</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{newPatientsMonth}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Today's Follow-ups */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <CalendarDaysIcon width={24} height={24} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Today's Follow-ups</h2>
            <span className="badge badge-followup">{followUps.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {followUps.length > 0 ? (
              followUps.map((followUp) => (
                <div key={followUp.id} className="card-elevated hover:shadow-lg transition-shadow" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', 
                    flexShrink: 0, background: getAvatarColor(followUp.full_name),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.25rem'
                  }}>
                    {followUp.photo_url ? (
                      <img src={followUp.photo_url} alt={followUp.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(followUp.full_name)
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Link href={`/patients/${followUp.patient_id}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{followUp.full_name}</h3>
                        </Link>
                        {followUp.gender && (
                          <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'var(--bg-surface-2)', borderRadius: '999px', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {followUp.gender}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {followUp.follow_up_time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                            <ClockIcon width={16} height={16} />
                            {followUp.follow_up_time.slice(0, 5)}
                          </div>
                        )}
                        <Link href={`/patients/${followUp.patient_id}`} className="btn-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', borderRadius: '999px' }}>
                          View Patient
                        </Link>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-2)', padding: '0.875rem', borderRadius: '8px', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Previous Diagnosis: </span>
                        {followUp.diagnosis ? (
                          <span style={{ color: 'var(--text-primary)' }}>{followUp.diagnosis}</span>
                        ) : (
                          <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>None recorded</span>
                        )}
                      </div>
                      {followUp.advice && (
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Advice: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{followUp.advice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CalendarDaysIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: 'var(--border-strong)' }} />
                <p style={{ fontSize: '1.0625rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Follow-ups Today</p>
                <p style={{ fontSize: '0.875rem' }}>Enjoy your day!</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Recent Patients */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <UserGroupIcon width={24} height={24} style={{ color: 'var(--color-secondary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Patients</h2>
          </div>

          <div className="card-elevated" style={{ padding: '0' }}>
            {recentPatients.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {recentPatients.map((patient, index) => (
                  <li key={patient.id} style={{ borderBottom: index < recentPatients.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                    <Link href={`/patients/${patient.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', textDecoration: 'none', transition: 'background 150ms' }} className="hover:bg-surface-2">
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', 
                        flexShrink: 0, background: getAvatarColor(patient.full_name),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.875rem'
                      }}>
                        {patient.photo_url ? (
                          <img src={patient.photo_url} alt={patient.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(patient.full_name)
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {patient.full_name}
                        </div>
                        {patient.tags && patient.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.25rem', overflow: 'hidden', marginTop: '2px', marginBottom: '4px' }}>
                            {patient.tags.slice(0, 2).map((tag, tIdx) => (
                              <span key={tIdx} style={{ fontSize: '0.65rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: '8px', border: '1px solid rgba(26,107,138,0.2)' }}>
                                {tag}
                              </span>
                            ))}
                            {patient.tags.length > 2 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{patient.tags.length - 2}</span>}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{patient.phone || 'No phone'}</span>
                          <span style={{ color: 'var(--text-disabled)' }}>Last visit: {new Date(patient.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No patients yet.
              </div>
            )}
            
            {recentPatients.length > 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface-2)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <Link href="/patients" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                  View All Patients →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
