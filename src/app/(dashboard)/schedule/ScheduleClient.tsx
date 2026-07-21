'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MagnifyingGlassIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

type FollowUp = {
  id: string;
  follow_up_date: string | Date;
  follow_up_time: string | null;
  diagnosis: string | null;
  patient_id: string;
  patient_name: string;
};

interface ScheduleClientProps {
  initialFollowUps: FollowUp[];
}

export function ScheduleClient({ initialFollowUps }: ScheduleClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'today' | 'week' | 'all'>('all');

  // Helper to normalize dates for comparison (ignoring time)
  const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const today = getStartOfDay(new Date());
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Parse strings to Dates just in case they come as strings from DB
  const parsedFollowUps = initialFollowUps.map(fu => ({
    ...fu,
    dateObj: getStartOfDay(new Date(fu.follow_up_date))
  }));

  // Calculate stats
  const stats = useMemo(() => {
    let todayCount = 0;
    let weekCount = 0;
    
    parsedFollowUps.forEach(fu => {
      const d = fu.dateObj;
      if (d.getTime() === today.getTime()) todayCount++;
      if (d >= today && d <= nextWeek) weekCount++;
    });

    return { today: todayCount, week: weekCount, total: parsedFollowUps.length };
  }, [parsedFollowUps, today, nextWeek]);

  // Filtered list
  const filtered = useMemo(() => {
    return parsedFollowUps.filter(fu => {
      // 1. Search filter
      if (searchTerm && !fu.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 2. Date filter
      const d = fu.dateObj;
      if (filterType === 'today' && d.getTime() !== today.getTime()) return false;
      if (filterType === 'week' && (d < today || d > nextWeek)) return false;
      
      return true;
    });
  }, [parsedFollowUps, searchTerm, filterType, today, nextWeek]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    
    filtered.forEach(fu => {
      const isToday = fu.dateObj.getTime() === today.getTime();
      const dateStr = fu.dateObj.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      const header = isToday ? `Today — ${dateStr}` : dateStr;
      
      if (!groups[header]) groups[header] = [];
      groups[header].push(fu);
    });

    return groups;
  }, [filtered, today]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr || timeStr === '-') return '-';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10));
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarDaysIcon width={32} height={32} style={{ color: 'var(--color-primary)' }} />
          Upcoming Follow-ups
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '1rem' }}>
          Manage your scheduled patient appointments.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
            <CalendarDaysIcon width={24} height={24} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Today's Follow-ups</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{stats.today}</p>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
            <ClockIcon width={24} height={24} style={{ color: '#10b981' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>This Week</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{stats.week}</p>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
            <UsersIcon width={24} height={24} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Upcoming</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
          </div>
        </div>

      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <MagnifyingGlassIcon width={20} height={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.75rem', borderRadius: '999px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}
          />
        </div>

        {/* Date Toggles */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: '0.25rem', borderRadius: '999px', border: '1px solid var(--border-default)' }}>
          {(['all', 'today', 'week'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                background: filterType === type ? 'var(--color-primary)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {type === 'all' ? 'All Upcoming' : type === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="card-elevated" style={{ overflow: 'hidden' }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <ClipboardDocumentCheckIcon width={48} height={48} style={{ color: 'var(--border-strong)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No follow-ups found</h3>
            <p style={{ color: 'var(--text-muted)' }}>You don't have any appointments matching this filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-default)', background: 'var(--bg-surface-2)' }}>
                  <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                  <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Time</th>
                  <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Prior Diagnosis</th>
                  <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([dateHeader, rows]) => {
                  const isTodayHeader = dateHeader.startsWith('Today');
                  
                  return (
                    <React.Fragment key={dateHeader}>
                      {/* Group Header Row */}
                      <tr style={{ background: isTodayHeader ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-base)', borderBottom: '1px solid var(--border-default)' }}>
                        <td colSpan={4} style={{ padding: '1rem 1.25rem', fontWeight: 700, color: isTodayHeader ? 'var(--color-primary)' : 'var(--text-primary)', fontSize: '0.9375rem' }}>
                          {dateHeader}
                        </td>
                      </tr>
                      
                      {/* Group Data Rows */}
                      {rows.map((item) => (
                        <tr 
                          key={item.id} 
                          style={{ 
                            borderBottom: '1px solid var(--border-default)',
                            background: isTodayHeader ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                            transition: 'background 0.2s ease'
                          }} 
                          className="hover:bg-surface-2"
                        >
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {/* Avatar */}
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: 'var(--color-primary)', 
                                color: 'white',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                flexShrink: 0
                              }}>
                                {getInitials(item.patient_name)}
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                                {item.patient_name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                              {formatTime(item.follow_up_time) !== '-' && <ClockIcon width={16} height={16} />}
                              {formatTime(item.follow_up_time)}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            {item.diagnosis ? (
                              <span style={{ color: 'var(--text-secondary)' }}>{item.diagnosis}</span>
                            ) : (
                              <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic', fontSize: '0.875rem' }}>No previous diagnosis</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <Link 
                              href={`/patients/${item.patient_id}`} 
                              className="btn-primary" 
                              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              View Patient
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
