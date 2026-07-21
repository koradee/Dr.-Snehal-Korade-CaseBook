'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface PatientData {
  id?: string;
  full_name: string;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  emergency_contact?: string | null;
  photo_url?: string | null;
  tags?: string[];
}

interface PatientFormProps {
  initialData?: PatientData;
  isEdit?: boolean;
}

export function PatientForm({ initialData, isEdit = false }: PatientFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PatientData>({
    full_name: initialData?.full_name || '',
    dob: initialData?.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
    gender: initialData?.gender || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    blood_group: initialData?.blood_group || '',
    allergies: initialData?.allergies || '',
    emergency_contact: initialData?.emergency_contact || '',
    photo_url: initialData?.photo_url || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  // DOB States
  const parsedDate = initialData?.dob ? new Date(initialData.dob) : null;
  const [dobDay, setDobDay] = useState(parsedDate ? parsedDate.getDate().toString() : '');
  const [dobMonth, setDobMonth] = useState(parsedDate ? (parsedDate.getMonth() + 1).toString() : '');
  const [dobYear, setDobYear] = useState(parsedDate ? parsedDate.getFullYear().toString() : '');

  useEffect(() => {
    if (dobYear && dobMonth && dobDay) {
      setFormData(prev => ({ ...prev, dob: `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}` }));
    } else {
      setFormData(prev => ({ ...prev, dob: '' }));
    }
  }, [dobYear, dobMonth, dobDay]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setPhotoFile(compressedFile);
        setPhotoPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error('Error compressing image:', error);
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return formData.photo_url || null;
    
    // Fallback patient ID for new patients (will just use 'new' in path)
    const patientId = isEdit && initialData?.id ? initialData.id : 'new';
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', photoFile);
    uploadFormData.append('type', 'photos');
    uploadFormData.append('patientId', patientId);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!res.ok) throw new Error('Failed to upload photo');
    const { publicUrl } = await res.json();
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) {
      setError('Full name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedPhotoUrl = await uploadPhoto();
      
      const payload = {
        ...formData,
        photo_url: uploadedPhotoUrl,
        dob: formData.dob || null, // Convert empty string to null
        tags, // Include tags
      };

      const url = isEdit && initialData?.id ? `/api/patients/${initialData.id}` : '/api/patients';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Upload/Save failed:', data);
        throw new Error(data.error || data.details || 'Failed to save patient');
      }

      const { patient } = await res.json();
      router.push(`/patients/${patient.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Caught error in handleSubmit:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-elevated" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        {isEdit ? 'Edit Patient' : 'Add New Patient'}
      </h2>
      
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Photo Upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            border: '2px dashed var(--border-strong)', overflow: 'hidden', position: 'relative'
          }}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <UserCircleIcon width={48} height={48} style={{ color: 'var(--text-disabled)' }} />
          )}
          <div style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.5)', width: '100%', textAlign: 'center', padding: '2px 0' }}>
            <PhotoIcon width={16} height={16} style={{ color: 'white', margin: '0 auto' }} />
          </div>
        </div>
        <div>
          <h3 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Patient Photo</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Click the circle to upload a photo.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Full Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name *</label>
          <input type="text" name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required />
        </div>

        {/* DOB & Gender */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Date of Birth</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="input-field" value={dobDay} onChange={(e) => setDobDay(e.target.value)} style={{ padding: '0.5rem', flex: 1 }}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="input-field" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} style={{ padding: '0.5rem', flex: 1 }}>
              <option value="">Month</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className="input-field" value={dobYear} onChange={(e) => setDobYear(e.target.value)} style={{ padding: '0.5rem', flex: 1.5 }}>
              <option value="">Year</option>
              {Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Gender</label>
          <select name="gender" className="input-field" value={formData.gender || ''} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Contact Info */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Phone Number</label>
          <input type="tel" name="phone" className="input-field" value={formData.phone || ''} onChange={handleChange} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Emergency Contact</label>
          <input type="text" name="emergency_contact" className="input-field" value={formData.emergency_contact || ''} onChange={handleChange} placeholder="Name & Phone" />
        </div>

        {/* Medical Info */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Blood Group</label>
          <select name="blood_group" className="input-field" value={formData.blood_group || ''} onChange={handleChange}>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Allergies (Comma separated)</label>
          <textarea 
            name="allergies" 
            className="input-field" 
            value={formData.allergies || ''} 
            onChange={handleChange} 
            rows={2} 
            placeholder="e.g. Penicillin, Peanuts"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Address */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Address</label>
          <textarea 
            name="address" 
            className="input-field" 
            value={formData.address || ''} 
            onChange={handleChange} 
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Tags */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Tags (Press Enter or comma to add)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {tags.map((tag, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-2)', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', border: '1px solid var(--border-default)' }}>
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', marginLeft: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }} className="hover:text-danger">
                  &times;
                </button>
              </div>
            ))}
          </div>
          <input 
            type="text" 
            className="input-field" 
            value={tagInput} 
            onChange={e => setTagInput(e.target.value)} 
            onKeyDown={handleTagKeyDown} 
            placeholder="e.g. Diabetic, Pediatric, Chronic Wound" 
          />
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn-ghost" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
}
