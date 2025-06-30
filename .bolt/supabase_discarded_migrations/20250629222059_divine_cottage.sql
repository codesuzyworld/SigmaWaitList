/*
  # Extend User Profiles for Settings Page

  1. New Columns Added
    - `username` (text, unique) - User's chosen username
    - `bio` (text) - User biography/description
    - `profile_picture_url` (text) - URL to profile picture in storage
    - `profile_visibility` (text, default 'public') - Profile visibility setting
    - `contact_preferences` (jsonb) - Contact preference settings
    - `notification_preferences` (jsonb) - Notification settings
    - `email_verified` (boolean, default false) - Email verification status

  2. Security
    - Maintain existing RLS policies
    - Add unique constraint for username
    - Add check constraints for valid values

  3. Performance
    - Add indexes for new searchable fields
*/

-- Add new columns to user_profiles table
DO $$
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text UNIQUE;
  END IF;

  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;

  -- Add profile_picture_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_picture_url text;
  END IF;

  -- Add profile_visibility column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_visibility'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_visibility text DEFAULT 'public';
  END IF;

  -- Add contact_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'contact_preferences'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN contact_preferences jsonb DEFAULT '{"email": true, "phone": false, "marketing": false}'::jsonb;
  END IF;

  -- Add notification_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN notification_preferences jsonb DEFAULT '{"email": true, "push": true, "in_app": true, "marketing": false}'::jsonb;
  END IF;

  -- Add email_verified column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
END $$;

-- Add check constraints for valid values
DO $$
BEGIN
  -- Add profile visibility constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_profile_visibility'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT valid_profile_visibility 
    CHECK (profile_visibility IN ('public', 'private', 'friends'));
  END IF;
END $$;

-- Add useful indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_visibility ON user_profiles(profile_visibility);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profile pictures
DO $$
BEGIN
  -- Allow authenticated users to upload their own profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'profile-pictures' AND name = 'Users can upload own profile pictures'
  ) THEN
    CREATE POLICY "Users can upload own profile pictures" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow authenticated users to update their own profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'profile-pictures' AND name = 'Users can update own profile pictures'
  ) THEN
    CREATE POLICY "Users can update own profile pictures" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow authenticated users to delete their own profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'profile-pictures' AND name = 'Users can delete own profile pictures'
  ) THEN
    CREATE POLICY "Users can delete own profile pictures" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow public access to view profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'profile-pictures' AND name = 'Public can view profile pictures'
  ) THEN
    CREATE POLICY "Public can view profile pictures" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'profile-pictures');
  END IF;
END $$;