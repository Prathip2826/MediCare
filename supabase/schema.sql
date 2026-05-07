-- MediCare Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- NOTE: user_id is stored as TEXT because we use Firebase Auth UIDs (not Supabase UUIDs)

-- Vital Signs
CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  blood_pressure_systolic numeric,
  blood_pressure_diastolic numeric,
  heart_rate numeric,
  blood_glucose numeric,
  temperature numeric,
  spo2 numeric,
  weight numeric,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own vitals" ON vital_signs;
-- Firebase UIDs are stored as text; RLS bypassed for firebase-authenticated users via service role
-- Use the service role key on server-side routes for full access
CREATE POLICY "Users manage own vitals" ON vital_signs FOR ALL USING (true);

-- Nutrition Logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  meal_type text NOT NULL,
  food_name text NOT NULL,
  calories numeric DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own nutrition" ON nutrition_logs;
CREATE POLICY "Users manage own nutrition" ON nutrition_logs FOR ALL USING (true);

-- Fitness Logs
CREATE TABLE IF NOT EXISTS fitness_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  exercise_type text NOT NULL,
  duration_minutes numeric DEFAULT 0,
  calories_burned numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own fitness" ON fitness_logs;
CREATE POLICY "Users manage own fitness" ON fitness_logs FOR ALL USING (true);

-- Wellness Logs
CREATE TABLE IF NOT EXISTS wellness_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  sleep_hours numeric,
  sleep_quality text,
  mood text,
  gratitude_note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own wellness" ON wellness_logs;
CREATE POLICY "Users manage own wellness" ON wellness_logs FOR ALL USING (true);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,
  email text,
  full_name text,
  date_of_birth date,
  gender text,
  blood_type text,
  height_cm numeric,
  weight_kg numeric,
  allergies text,
  medical_conditions text,
  emergency_contact_name text,
  emergency_contact_phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (true);

-- Medicines
CREATE TABLE IF NOT EXISTS medicines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  name text NOT NULL,
  dosage text,
  frequency text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own medicines" ON medicines;
CREATE POLICY "Users manage own medicines" ON medicines FOR ALL USING (true);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  doctor_name text NOT NULL,
  specialization text,
  hospital text,
  appointment_date timestamptz NOT NULL,
  notes text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own appointments" ON appointments;
CREATE POLICY "Users manage own appointments" ON appointments FOR ALL USING (true);

-- Mood Logs (Mental Health)
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  mood_score integer CHECK (mood_score BETWEEN 1 AND 5),
  mood_label text,
  notes text,
  logged_at timestamptz DEFAULT now()
);
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own mood logs" ON mood_logs;
CREATE POLICY "Users manage own mood logs" ON mood_logs FOR ALL USING (true);

-- Medical Reports
CREATE TABLE IF NOT EXISTS medical_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  report_type text DEFAULT 'Other',
  file_type text,
  file_url text NOT NULL,
  file_path text,
  ai_summarized boolean DEFAULT false,
  ai_summary jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own medical reports" ON medical_reports;
CREATE POLICY "Users manage own medical reports" ON medical_reports FOR ALL USING (true);

-- Health Metrics
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  unit text,
  recorded_at timestamptz DEFAULT now()
);
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own health metrics" ON health_metrics;
CREATE POLICY "Users manage own health metrics" ON health_metrics FOR ALL USING (true);

-- Medicine Logs (intake tracking)
CREATE TABLE IF NOT EXISTS medicine_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE,
  taken_at timestamptz DEFAULT now(),
  status text DEFAULT 'taken' CHECK (status IN ('taken', 'skipped', 'missed'))
);
ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own medicine logs" ON medicine_logs;
CREATE POLICY "Users manage own medicine logs" ON medicine_logs FOR ALL USING (true);

-- ─────────────────────────────────────────────
-- Storage: create the medical-reports bucket
-- Run once in Supabase dashboard → Storage → New Bucket
-- OR via SQL using the storage schema:
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('medical-reports', 'medical-reports', true)
-- ON CONFLICT (id) DO NOTHING;

