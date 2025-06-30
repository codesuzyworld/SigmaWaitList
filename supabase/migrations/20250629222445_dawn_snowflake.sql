/*
  # Extend user_profiles table for profile settings

  1. New Columns
    - `username` (text, unique) - User's unique username
    - `bio` (text) - User's biography/description
    - `profile_picture_url` (text) - URL to user's profile picture
    - `profile_visibility` (text) - Profile visibility setting
    - `contact_preferences` (jsonb) - Contact preference settings
    - `notification_preferences` (jsonb) - Notification preference settings
    - `email_verified` (boolean) - Email verification status

  2. Constraints
    - Profile visibility must be 'public', 'private', or 'friends'

  3. Indexes
    - Username index for fast lookups
    - Profile visibility index for filtering
    - Email verified index for filtering
*/

-- Add new columns to user_profiles table
DO $$
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text;
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

-- Add unique constraint for username if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_username_key' AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
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