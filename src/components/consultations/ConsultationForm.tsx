'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { CameraIcon, XMarkIcon, PlusIcon, DocumentDuplicateIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { PastConsultationViewer } from './PastConsultationViewer';

interface PrescriptionItem {
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ConsultationFormProps {
  patientId: string;
  pastConsultations?: any[]; 
}

export function ConsultationForm({ patientId, pastConsultations }: ConsultationFormProps) {
  const previousConsultation = pastConsultations && pastConsultations.length > 0 ? pastConsultations[0] : null;
  const hasPast = pastConsultations && pastConsultations.length > 0;
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [isListeningTo, setIsListeningTo] = useState<'chief_complaint' | 'history' | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Draft Key
  const DRAFT_KEY = `consultation_draft_${patientId}`;

  // Form State
  const [visitType, setVisitType] = useState('new');
  const [vitals, setVitals] = useState({
    bp: '',
    pulse: '',
    temp: '',
    weight: '',
    height: '',
    spo2: '',
    bmi: '',
  });
  const [textFields, setTextFields] = useState({
    chief_complaint: '',
    history: '',
    examination_findings: '',
    diagnosis: '',
    advice: '',
  });
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [followUp, setFollowUp] = useState({
    date: '',
    time: '',
  });

  // Images State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete State
  const [drugSuggestions, setDrugSuggestions] = useState<any[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Auto-calculate BMI
  useEffect(() => {
    const weightNum = parseFloat(vitals.weight);
    const heightNum = parseFloat(vitals.height); // in cm
    if (weightNum > 0 && heightNum > 0) {
      const heightM = heightNum / 100;
      const bmi = (weightNum / (heightM * heightM)).toFixed(1);
      setVitals(prev => ({ ...prev, bmi }));
    } else {
      setVitals(prev => ({ ...prev, bmi: '' }));
    }
  }, [vitals.weight, vitals.height]);

  // Handle clicking outside autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setActiveItemIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Offline Draft Logic ---
  // Load draft on mount (only if not loading from previous consultation)
  useEffect(() => {
    if (!previousConsultation) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setVisitType(parsed.visitType || 'new');
          setVitals(parsed.vitals || vitals);
          setTextFields(parsed.textFields || textFields);
          setPrescriptionItems(parsed.prescriptionItems || []);
          setFollowUp(parsed.followUp || followUp);
          setDraftSavedAt(new Date(parsed.savedAt));
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [patientId, previousConsultation, DRAFT_KEY]);

  // Save draft on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        visitType, vitals, textFields, prescriptionItems, followUp, savedAt: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftSavedAt(new Date());
    }, 2000);
    return () => clearTimeout(timer);
  }, [visitType, vitals, textFields, prescriptionItems, followUp, DRAFT_KEY]);

  // --- Voice to Text Logic ---
  const toggleSpeechRecognition = (field: 'chief_complaint' | 'history') => {
    if (isListeningTo === field) {
      setIsListeningTo(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListeningTo(field);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        setTextFields(prev => ({
          ...prev,
          [field]: prev[field] ? prev[field] + ' ' + transcript : transcript
        }));
        setIsListeningTo(null);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListeningTo(null);
    };

    recognition.onend = () => {
      setIsListeningTo(null);
    };

    recognition.start();
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      const compressedFiles = await Promise.all(
        filesArray.map(async (file) => {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1500,
              useWebWorker: true,
            };
            return await imageCompression(file, options);
          } catch (error) {
            console.error('Error compressing image:', error);
            return file;
          }
        })
      );

      setImageFiles(prev => [...prev, ...compressedFiles]);
      
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // --- Prescription Logic ---
  const addPrescriptionItem = () => {
    setPrescriptionItems(prev => [
      ...prev,
      { drug_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = async (index: number, field: keyof PrescriptionItem, value: string) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);

    // Fetch autocomplete suggestions if drug_name is changing
    if (field === 'drug_name' && value.length >= 2) {
      setActiveItemIndex(index);
      try {
        const res = await fetch(`/api/drugs/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setDrugSuggestions(data.drugs || []);
        }
      } catch (err) {
        console.error('Failed to fetch drug suggestions', err);
      }
    } else if (field === 'drug_name' && value.length < 2) {
      setDrugSuggestions([]);
    }
  };

  const selectDrugSuggestion = (index: number, drug: any) => {
    const newItems = [...prescriptionItems];
    newItems[index].drug_name = drug.drug_name;
    if (!newItems[index].dosage && drug.default_dosage) {
      newItems[index].dosage = drug.default_dosage;
    }
    if (!newItems[index].frequency && drug.default_frequency) {
      newItems[index].frequency = drug.default_frequency;
    }
    setPrescriptionItems(newItems);
    setActiveItemIndex(null);
    setDrugSuggestions([]);
  };

  const loadPreviousConsultation = () => {
    if (!previousConsultation) return;

    // Load diagnosis
    setTextFields(prev => ({
      ...prev,
      diagnosis: previousConsultation.diagnosis || prev.diagnosis
    }));

    // Load structured prescription if exists
    if (previousConsultation.prescription_items && previousConsultation.prescription_items.length > 0) {
      const items = previousConsultation.prescription_items.map((item: any) => ({
        drug_name: item.drug_name || '',
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        duration: item.duration || '',
        instructions: item.instructions || ''
      }));
      setPrescriptionItems(items);
    } else if (previousConsultation.prescription_text) {
      // Fallback for Phase 1 legacy text prescription
      setPrescriptionItems([{
        drug_name: previousConsultation.prescription_text, // Shoving into drug_name to force re-structuring
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'clinical-images');
      formData.append('patientId', patientId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload image');
      const { publicUrl } = await res.json();
      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const imageUrls = await uploadImages();

      // Clean up vitals for JSON (convert strings to numbers where appropriate)
      const cleanedVitals = {
        bp: vitals.bp || null,
        pulse: vitals.pulse ? parseFloat(vitals.pulse) : null,
        temp: vitals.temp ? parseFloat(vitals.temp) : null,
        weight: vitals.weight ? parseFloat(vitals.weight) : null,
        height: vitals.height ? parseFloat(vitals.height) : null,
        spo2: vitals.spo2 ? parseFloat(vitals.spo2) : null,
        bmi: vitals.bmi ? parseFloat(vitals.bmi) : null,
      };

      const payload = {
        patient_id: patientId,
        visit_type: visitType,
        vitals: cleanedVitals,
        ...textFields,
        prescription_items: prescriptionItems.filter(item => item.drug_name.trim() !== ''),
        follow_up_date: followUp.date || null,
        follow_up_time: followUp.time || null,
        clinical_images: imageUrls,
      };

      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save consultation');
      }

      // Success! Clear draft and return to patient profile.
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/patients/${patientId}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
      setLoading(false);
    }
  };

  return (
    <div className={hasPast ? "md:landscape:grid md:landscape:grid-cols-2 md:landscape:gap-8 relative" : ""}>
      {/* Form Container */}
      <div className={hasPast ? "pb-24 md:landscape:pb-0" : ""}>
        <form onSubmit={handleSubmit} className="card-elevated" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              New Consultation
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {previousConsultation && (
                <button 
                  type="button" 
                  onClick={loadPreviousConsultation}
                  className="btn-ghost" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginRight: '1rem' }}
                >
                  <DocumentDuplicateIcon width={18} height={18} />
                  Load Previous
                </button>
              )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <input 
              type="radio" 
              name="visitType" 
              value="new" 
              checked={visitType === 'new'} 
              onChange={(e) => setVisitType(e.target.value)} 
              style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
            />
            New Case
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <input 
              type="radio" 
              name="visitType" 
              value="follow_up" 
              checked={visitType === 'follow_up'} 
              onChange={(e) => setVisitType(e.target.value)}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
            />
            Follow Up
          </label>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* 1. Clinical Images Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Clinical Images
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {imagePreviews.map((src, idx) => (
            <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
              <img src={src} alt="Clinical" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
              >
                <XMarkIcon width={14} height={14} />
              </button>
            </div>
          ))}
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              width: '100px', height: '100px', borderRadius: '8px', background: 'var(--bg-surface-2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', border: '2px dashed var(--border-strong)', color: 'var(--text-muted)'
            }}
            className="hover:border-primary hover:text-primary transition-colors"
          >
            <CameraIcon width={28} height={28} style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Add Image</span>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            multiple 
            capture="environment" 
            style={{ display: 'none' }} 
          />
        </div>
      </section>

      {/* 2. Vitals Section (Large Tappable Inputs) */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Vitals
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>BP (mmHg)</label>
            <input type="text" name="bp" placeholder="120/80" className="input-field" value={vitals.bp} onChange={handleVitalsChange} style={{ fontSize: '1.125rem', padding: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Pulse (bpm)</label>
            <input type="number" name="pulse" placeholder="72" className="input-field" value={vitals.pulse} onChange={handleVitalsChange} style={{ fontSize: '1.125rem', padding: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Temp (°F)</label>
            <input type="number" step="0.1" name="temp" placeholder="98.6" className="input-field" value={vitals.temp} onChange={handleVitalsChange} style={{ fontSize: '1.125rem', padding: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Weight (kg)</label>
            <input type="number" step="0.1" name="weight" placeholder="70" className="input-field" value={vitals.weight} onChange={handleVitalsChange} style={{ fontSize: '1.125rem', padding: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Height (cm)</label>
            <input type="number" step="0.1" name="height" placeholder="175" className="input-field" value={vitals.height} onChange={handleVitalsChange} style={{ fontSize: '1.125rem', padding: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>SpO2 (%)</label>
            <input type="number" name="spo2" placeholder="98" className="input-field" value={vitals.spo2} onChange={handleVitalsChange} style={{ fontSize: '1.125rem', padding: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>BMI</label>
            <input type="text" readOnly className="input-field" value={vitals.bmi} style={{ fontSize: '1.125rem', padding: '0.75rem', background: 'var(--bg-surface-2)', color: 'var(--text-primary)' }} tabIndex={-1} />
          </div>
        </div>
      </section>

      {/* 3. Text Areas */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Chief Complaint</label>
            <button 
              type="button" 
              onClick={() => toggleSpeechRecognition('chief_complaint')}
              className="btn-ghost" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: isListeningTo === 'chief_complaint' ? 'var(--color-danger)' : 'var(--text-muted)' }}
            >
              <MicrophoneIcon width={16} height={16} />
              {isListeningTo === 'chief_complaint' ? 'Listening...' : 'Voice'}
            </button>
          </div>
          <textarea name="chief_complaint" className="input-field" rows={2} value={textFields.chief_complaint} onChange={handleTextChange} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>History of Presenting Illness</label>
            <button 
              type="button" 
              onClick={() => toggleSpeechRecognition('history')}
              className="btn-ghost" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: isListeningTo === 'history' ? 'var(--color-danger)' : 'var(--text-muted)' }}
            >
              <MicrophoneIcon width={16} height={16} />
              {isListeningTo === 'history' ? 'Listening...' : 'Voice'}
            </button>
          </div>
          <textarea name="history" className="input-field" rows={3} value={textFields.history} onChange={handleTextChange} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Examination Findings</label>
          <textarea name="examination_findings" className="input-field" rows={3} value={textFields.examination_findings} onChange={handleTextChange} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Diagnosis</label>
          <textarea name="diagnosis" className="input-field" rows={2} value={textFields.diagnosis} onChange={handleTextChange} style={{ resize: 'vertical', border: '1px solid var(--color-primary)', background: 'var(--color-primary-light)' }} />
        </div>
      </section>

      {/* 4. Structured Prescription Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Prescription
          </h3>
          <button type="button" onClick={addPrescriptionItem} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
            <PlusIcon width={16} height={16} /> Add Drug
          </button>
        </div>

        {prescriptionItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px dashed var(--border-strong)', color: 'var(--text-muted)' }}>
            No prescription added. Click &quot;Add Drug&quot; to begin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptionItems.map((item, index) => (
              <div key={index} style={{ background: 'var(--bg-surface-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-default)', position: 'relative' }}>
                <button type="button" onClick={() => removePrescriptionItem(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-danger">
                  <XMarkIcon width={20} height={20} />
                </button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', paddingRight: '1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Drug Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Paracetamol" 
                      value={item.drug_name} 
                      onChange={e => handlePrescriptionChange(index, 'drug_name', e.target.value)} 
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {activeItemIndex === index && drugSuggestions.length > 0 && (
                      <div ref={autocompleteRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '4px', boxShadow: 'var(--shadow-md)', maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                        {drugSuggestions.map((drug, dIdx) => (
                          <div 
                            key={dIdx} 
                            onClick={() => selectDrugSuggestion(index, drug)}
                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-default)' }}
                            className="hover:bg-surface-2"
                          >
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{drug.drug_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drug.default_dosage} • {drug.default_frequency}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Dosage</label>
                    <input type="text" className="input-field" placeholder="500 mg" value={item.dosage} onChange={e => handlePrescriptionChange(index, 'dosage', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Frequency</label>
                    <input type="text" className="input-field" placeholder="1-0-1" value={item.frequency} onChange={e => handlePrescriptionChange(index, 'frequency', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Duration</label>
                    <input type="text" className="input-field" placeholder="5 days" value={item.duration} onChange={e => handlePrescriptionChange(index, 'duration', e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Special Instructions (Optional)</label>
                  <input type="text" className="input-field" placeholder="e.g. After meals" value={item.instructions} onChange={e => handlePrescriptionChange(index, 'instructions', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Advice */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Advice / Investigations</label>
          <textarea name="advice" className="input-field" rows={3} value={textFields.advice} onChange={handleTextChange} style={{ resize: 'vertical' }} />
        </div>
      </section>

      {/* 6. Follow Up */}
      <section style={{ marginBottom: '2.5rem', background: 'var(--bg-surface-2)', padding: '1.5rem', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Follow-up Schedule
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={followUp.date} 
              onChange={e => setFollowUp(prev => ({ ...prev, date: e.target.value }))} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</label>
            <input 
              type="time" 
              className="input-field" 
              value={followUp.time} 
              onChange={e => setFollowUp(prev => ({ ...prev, time: e.target.value }))} 
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn-ghost" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.875rem 2rem', fontSize: '1.0625rem' }}>
          {loading ? 'Saving...' : 'Save Consultation'}
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {draftSavedAt && <span>Draft saved locally at {draftSavedAt.toLocaleTimeString()}</span>}
        </div>
        <p style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Note: Saved consultations are immutable. Please verify details before saving.
        </p>
      </div>

    </form>
    </div>

    {/* Side-by-Side Viewer (Desktop & Tablet Landscape) & Overlay (Mobile & Tablet Portrait) */}
    {hasPast && (
      <>
        {/* Mobile / Portrait Toggle Button */}
        <div className="md:landscape:hidden fixed bottom-0 left-0 right-0 p-4 z-40" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
          <button 
            type="button" 
            className="btn-secondary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center' }}
            onClick={() => setIsViewerOpen(!isViewerOpen)}
          >
            {isViewerOpen ? 'Close Previous Visit' : 'View Previous Visit'}
          </button>
        </div>

        {/* Viewer Container */}
        <div className={`
          md:landscape:block
          ${isViewerOpen ? 'fixed inset-0 z-50 overflow-y-auto mt-16 pb-20' : 'hidden'}
          md:landscape:relative md:landscape:inset-auto md:landscape:z-auto md:landscape:overflow-visible md:landscape:mt-0 md:landscape:pb-0
        `} style={isViewerOpen ? { background: 'var(--bg-base)' } : {}}>
          {isViewerOpen && (
            <div className="md:landscape:hidden p-4 flex justify-end">
               <button onClick={() => setIsViewerOpen(false)} className="btn-ghost text-red-500 font-bold p-2">Close</button>
            </div>
          )}
          <PastConsultationViewer consultations={pastConsultations!} />
        </div>
      </>
    )}
  </div>
  );
}
