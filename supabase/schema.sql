-- New tables for MediCare expanded features
-- Run this in your Supabase SQL Editor

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
CREATE POLICY "Users manage own vitals" ON vital_signs
  USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

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
CREATE POLICY "Users manage own nutrition" ON nutrition_logs
  USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

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
CREATE POLICY "Users manage own fitness" ON fitness_logs
  USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

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
CREATE POLICY "Users manage own wellness" ON wellness_logs
  USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Profiles (update existing or create)
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
CREATE POLICY "Users manage own profile" ON profiles
  USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);
