'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BeakerIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InactivityLock } from '@/components/ui/InactivityLock';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

const NAV_ITEMS = [
  { href: '/',            label: 'Dashboard',   icon: HomeIcon },
  { href: '/patients',    label: 'Patients',    icon: UserGroupIcon },
  { href: '/schedule',    label: 'Schedule',    icon: CalendarDaysIcon },
  { href: '/drug-library',label: 'Drug Library',icon: BeakerIcon },
  { href: '/settings',    label: 'Settings',    icon: Cog6ToothIcon },
];

interface AppShellProps {
  children: React.ReactNode;
  doctorName?: string;
}

export function AppShell({ children, doctorName = 'Dr. Snehal Korade' }: AppShellProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-base)',
      }}
    >
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className="sidebar"
        style={{
          width: '240px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflowY: 'auto',
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            padding: '1.25rem 1rem 1rem',
            borderBottom: '1px solid var(--sidebar-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            {/* Medical cross icon */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="2" width="4" height="14" rx="1" fill="white"/>
                <rect x="2" y="7" width="14" height="4" rx="1" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                CaseBook
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                Personal EMR
              </div>
            </div>
          </div>
        </div>

        {/* Doctor info */}
        <div style={{ padding: '0.875rem 1rem 0.75rem', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                flexShrink: 0,
              }}
            >
              {doctorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {doctorName}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 500 }}>
                ● Online
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon width={18} height={18} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: backup, theme toggle + logout */}
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <a
            href="/api/backup"
            download
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8125rem', padding: '0.375rem 0.75rem', color: 'var(--text-secondary)' }}
            title="Backup Full Database"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
            Backup Data
          </a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemeToggle size="sm" />
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with Global Search */}
        <header
          style={{
            padding: '1rem 1.75rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <GlobalSearch />
        </header>
        
        {children}
      </main>

      {/* ── Inactivity lock overlay ────────────────────────────────────────── */}
      <InactivityLock />
    </div>
  );
}
