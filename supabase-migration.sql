-- Run this in your Supabase SQL editor (https://supabase.com/dashboard/project/nqiicdtneorcvpgxxqsd/sql/new)

-- 1. Profiles table (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Farm parameters table
CREATE TABLE IF NOT EXISTS farm_params (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farm_size TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  climate TEXT NOT NULL,
  water_source TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Cultivation profiles table
CREATE TABLE IF NOT EXISTS cultivation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  experience TEXT NOT NULL,
  method TEXT NOT NULL,
  season TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only read/update their own data
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Farm params policies
CREATE POLICY "Users can read own farm params"
  ON farm_params FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farm params"
  ON farm_params FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farm params"
  ON farm_params FOR UPDATE
  USING (auth.uid() = user_id);

-- Cultivation profile policies
CREATE POLICY "Users can read own cultivation profile"
  ON cultivation_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cultivation profile"
  ON cultivation_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cultivation profile"
  ON cultivation_profiles FOR UPDATE
  USING (auth.uid() = user_id);
