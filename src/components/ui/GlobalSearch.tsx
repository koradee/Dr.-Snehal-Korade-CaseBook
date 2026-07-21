'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  full_name: string;
  phone: string | null;
  photo_url: string | null;
  gender: string | null;
  dob: string | null;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.patients || []);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (patientId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/patients/${patientId}`);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      <div style={{ position: 'relative' }}>
        <MagnifyingGlassIcon 
          width={18} 
          height={18} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-muted)' 
          }} 
        />
        <input
          type="text"
          className="input-field"
          placeholder="Search patients by name, phone, or diagnosis..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          style={{ paddingLeft: '38px', borderRadius: '24px', background: 'var(--bg-surface-2)', border: 'none' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <XMarkIcon width={16} height={16} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div 
          className="card-elevated animate-fade-in"
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            left: 0, 
            right: 0, 
            maxHeight: '400px', 
            overflowY: 'auto', 
            zIndex: 50,
            padding: '0.5rem 0'
          }}
        >
          {loading && results.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    onClick={() => handleSelect(patient.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border-default)',
                      transition: 'background 150ms ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {patient.photo_url ? (
                      <img 
                        src={patient.photo_url} 
                        alt={patient.full_name} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <UserCircleIcon width={36} height={36} style={{ color: 'var(--text-disabled)' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{patient.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {patient.phone || 'No phone'} • {patient.gender || 'Unspecified'}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No patients found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
