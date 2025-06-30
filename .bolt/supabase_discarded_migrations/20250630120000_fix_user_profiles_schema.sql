/*
  # Fix user_profiles table schema for profile settings

  Problem: The user_profiles table uses `id` as primary key referencing auth.users(id),
  but the profile settings code expects a separate `user_id` column.

  Solution: Add a user_id column and update policies to maintain compatibility
  with both patterns while we transition.

  Changes:
  1. Add user_id column that mirrors the id column
  2. Update triggers to populate user_id
  3. Add indexes for user_id queries
  4. Maintain backward compatibility
*/

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Populate user_id with existing id values for existing records
UPDATE user_profiles SET user_id = id WHERE user_id IS NULL;

-- Add foreign key constraint for user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_user_id_fkey' AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint on user_id to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_user_id_key' AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Update the handle_new_user_profile function to set both id and user_id
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_id)
  VALUES (NEW.id, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for user_id queries
CREATE POLICY "Users can view own profile via user_id" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile via user_id" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile via user_id" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile via user_id" ON user_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add index for user_id queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Update existing records to ensure user_id is set
UPDATE user_profiles SET user_id = id WHERE user_id IS NULL;