export interface UserProfile {
  id: string; // Supabase UUID
  firebase_uid: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  date_of_birth: string | null; // ISO Date string
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  country: string | null;
  language: string;
  emergency_contact: string | null;
  medical_conditions: string[];
  allergies: string[];
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MedicineLog {
  id: string;
  medicine_id: string;
  user_id: string;
  taken_at: string;
  status: 'taken' | 'skipped' | 'missed';
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_name: string | null;
  specialization: string | null;
  hospital: string | null;
  appointment_date: string | null;
  notes: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  reminder_sent: boolean;
  created_at: string;
}

export interface MedicalReport {
  id: string;
  user_id: string;
  title: string | null;
  report_type: 'blood_test' | 'xray' | 'mri' | 'prescription' | 'other' | string;
  file_url: string | null;
  ai_summary: string | null;
  uploaded_at: string;
}

export interface SymptomCheck {
  id: string;
  user_id: string;
  symptoms: string[];
  ai_response: any;
  severity: 'Mild' | 'Moderate' | 'Severe' | string;
  checked_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood_score: number; // 1-5
  mood_label: string | null;
  notes: string | null;
  logged_at: string;
}

export interface HealthMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number | null;
  unit: string | null;
  recorded_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  created_at: string;
}
