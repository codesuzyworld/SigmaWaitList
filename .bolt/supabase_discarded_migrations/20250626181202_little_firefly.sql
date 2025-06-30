/*
  # Initial Schema for Sigma AI Business Partner Platform

  1. New Tables
    - `leads` - Store waitlist signups
      - `id` (uuid, primary key)
      - `email` (text, nullable) 
      - `created_at` (timestamp with timezone)
    - `profiles` - User profile management
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `image` (text)
      - `customer_id` (text) - Stripe customer ID
      - `price_id` (text) - Stripe price ID
      - `has_access` (boolean, default false)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on both tables
    - Add public insert policy for leads (waitlist signups)
    - Add user-specific CRUD policies for profiles
    
  3. Functions & Triggers
    - Auto-update updated_at timestamp on profile changes
    - Auto-create profile when new user signs up
*/

-- Create leads table for waitlist signups
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  name text,
  email text,
  image text,
  customer_id text,
  price_id text,
  has_access boolean DEFAULT false,
  created_at timestamptz DEFAULT (now() AT TIME ZONE 'UTC'::text),
  updated_at timestamptz DEFAULT (now() AT TIME ZONE 'UTC'::text),
  
  -- Foreign key to Supabase auth.users
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads table
CREATE POLICY "insert_lead" ON leads
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- RLS Policies for profiles table  
CREATE POLICY "read_own_profile_data" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "insert_own_profile_data" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile_data" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "delete_own_profile_data" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_has_access ON profiles(has_access);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);