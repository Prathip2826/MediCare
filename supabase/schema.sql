-- USERS PROFILE TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  country TEXT,
  language TEXT DEFAULT 'en',
  emergency_contact TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICINES TABLE
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT, -- morning/afternoon/night/custom
  start_date DATE,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICINE LOGS TABLE
CREATE TABLE medicine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT -- taken/skipped/missed
);

-- APPOINTMENTS TABLE
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_name TEXT,
  specialization TEXT,
  hospital TEXT,
  appointment_date TIMESTAMPTZ,
  notes TEXT,
  status TEXT DEFAULT 'upcoming', -- upcoming/completed/cancelled
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL REPORTS TABLE
CREATE TABLE medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  report_type TEXT, -- blood_test/xray/mri/other
  file_url TEXT,
  ai_summary TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYMPTOM CHECKS TABLE
CREATE TABLE symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symptoms TEXT[],
  ai_response JSONB,
  severity TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOOD TRACKING TABLE
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  mood_label TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- HEALTH METRICS TABLE
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type TEXT, -- bmi/blood_pressure/glucose/steps/water
  value NUMERIC,
  unit TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT HISTORY TABLE
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT, -- user/assistant
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Note: In a real-world scenario with Supabase + Firebase Auth, 
-- you'd either mint a custom JWT from Firebase to pass to Supabase,
-- or use the Supabase Service Role key in your Next.js API routes (Serverless) 
-- to bypass RLS, validating the Firebase token in the API route first.
-- Since this architecture relies on Next.js API Routes for backend logic,
-- we'll assume API routes use the Service Role key after verifying Firebase Auth.
