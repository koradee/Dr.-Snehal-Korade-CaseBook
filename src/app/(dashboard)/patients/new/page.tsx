import { Metadata } from 'next';
import { PatientForm } from '@/components/patients/PatientForm';

export const metadata: Metadata = {
  title: 'Add New Patient',
};

export default function AddPatientPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <PatientForm />
    </div>
  );
}
