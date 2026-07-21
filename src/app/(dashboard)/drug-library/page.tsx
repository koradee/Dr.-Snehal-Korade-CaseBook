import React from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { query } from '@/lib/db';

export const metadata = {
  title: 'Drug Library',
};

async function getDrugs() {
  return await query(`
    SELECT id, drug_name, default_dosage, default_frequency, created_at
    FROM drug_library
    ORDER BY drug_name ASC
  `);
}

export default async function DrugLibraryPage() {
  const drugs = await getDrugs();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BeakerIcon width={28} height={28} style={{ color: 'var(--color-primary)' }} />
          Drug Library
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          This library automatically learns the drugs, dosages, and frequencies you prescribe most often. 
          It powers the autocomplete in your consultation forms.
        </p>
      </div>

      <div className="card-elevated">
        {drugs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No drugs in your library yet. Drugs are automatically added when you prescribe them to a patient!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface-2)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Drug Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Default Dosage</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Default Frequency</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Learned On</th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((drug: any) => (
                  <tr key={drug.id} style={{ borderBottom: '1px solid var(--border-default)' }} className="hover:bg-surface-2">
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{drug.drug_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{drug.default_dosage || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{drug.default_frequency || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(drug.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
