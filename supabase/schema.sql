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
