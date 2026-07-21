'use client';

import React from 'react';
import { Cog6ToothIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cog6ToothIcon width={28} height={28} style={{ color: 'var(--color-primary)' }} />
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Manage your CaseBook preferences and data.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Appearance */}
        <section className="card-elevated" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
            Appearance
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Theme Preference</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toggle between light and dark mode</div>
            </div>
            <ThemeToggle size="md" />
          </div>
        </section>

        {/* Data Management */}
        <section className="card-elevated" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
            Data Management
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Backup Database</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Download a complete JSON export of all your patient and consultation data.</div>
            </div>
            <a 
              href="/api/backup" 
              download 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
            >
              <ArrowDownTrayIcon width={18} height={18} />
              Export Data
            </a>
          </div>
        </section>

        {/* About */}
        <section className="card-elevated" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
            About CaseBook
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}><strong>Version:</strong> 1.0.0 (Local Desktop Edition)</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Storage:</strong> Local PostgreSQL & Local File System</p>
            <p>CaseBook is a 100% offline Personal Electronic Medical Record (EMR) system built for speed, privacy, and clinical efficiency.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
