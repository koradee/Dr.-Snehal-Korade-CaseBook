'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const INACTIVITY_MS =
  (parseInt(process.env.NEXT_PUBLIC_INACTIVITY_MINUTES || '15', 10)) * 60 * 1000;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

interface InactivityLockProps {
  /** Called when the user successfully re-authenticates through the lock screen */
  onUnlock?: () => void;
}

export function InactivityLock({ onUnlock }: InactivityLockProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLocked) {
      timerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, INACTIVITY_MS);
    }
  }, [isLocked]);

  // Attach activity listeners
  useEffect(() => {
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true })
    );
    resetTimer(); // Start the timer immediately
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  // Focus input when lock appears
  useEffect(() => {
    if (isLocked) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLocked]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsLocked(false);
        setPassword('');
        resetTimer();
        onUnlock?.();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isLocked) return null;

  return (
    <div className="lock-overlay" aria-modal="true" role="dialog" aria-label="Session locked">
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '380px',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center',
        }}
      >
        {/* Lock Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <LockClosedIcon
            width={28}
            height={28}
            style={{ color: 'var(--color-primary)' }}
          />
        </div>

        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}
        >
          Session Locked
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          You were inactive for a while. Enter your password to continue.
        </p>

        <form onSubmit={handleUnlock} style={{ textAlign: 'left' }}>
          <div style={{ position: 'relative' }}>
            <input
              id="lock-password"
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
              autoComplete="current-password"
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                display: 'flex',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon width={18} height={18} />
              ) : (
                <EyeIcon width={18} height={18} />
              )}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: 'var(--color-danger)',
                fontSize: '0.8125rem',
                marginTop: '0.5rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !password.trim()}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '16px', height: '16px' }} />
                Verifying…
              </span>
            ) : (
              'Unlock'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
          <a
            href="/api/auth/logout"
            style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}
            onClick={async (e) => {
              e.preventDefault();
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
          >
            Sign out instead
          </a>
        </div>
      </div>
    </div>
  );
}
