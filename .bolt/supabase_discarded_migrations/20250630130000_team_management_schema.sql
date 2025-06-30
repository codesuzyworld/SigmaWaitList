/*
  # Team Management System - Database Schema
  
  This migration creates the foundation for team collaboration in BasedSigma:
  
  1. Teams Table - Core team information
  2. Team Members Table - User membership with roles
  3. Team Invitations Table - Invitation management
  4. Team Permissions Table - Granular permission system
  5. Audit Logs Table - Activity tracking
  6. Document Storage - File management
  
  Features:
  - Role-based access control (Owner, Admin, Member, Viewer)
  - Invitation system with expiry
  - Audit trails for all actions
  - Document management with versioning
  - Real-time collaboration support
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  avatar_url text,
  
  -- Team settings
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'invite_only')),
  max_members integer DEFAULT 10,
  features jsonb DEFAULT '{"documents": true, "banking": false, "analytics": false}'::jsonb,
  
  -- Ownership
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- 2. Team Roles (enum-like table for referential integrity)
CREATE TABLE IF NOT EXISTS team_roles (
  role text PRIMARY KEY,
  description text NOT NULL,
  level integer NOT NULL UNIQUE,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Insert default roles
INSERT INTO team_roles (role, description, level, permissions) VALUES 
  ('owner', 'Team owner with full control', 100, '{"all": true}'::jsonb),
  ('admin', 'Administrator with management permissions', 80, '{"manage_members": true, "manage_settings": true, "manage_documents": true, "view_analytics": true}'::jsonb),
  ('member', 'Regular team member', 50, '{"create_documents": true, "edit_own_documents": true, "view_documents": true}'::jsonb),
  ('viewer', 'Read-only access', 10, '{"view_documents": true}'::jsonb)
ON CONFLICT (role) DO UPDATE SET 
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  permissions = EXCLUDED.permissions;

-- 3. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL REFERENCES team_roles(role) DEFAULT 'member',
  
  -- Status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Membership details
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  last_active_at timestamptz DEFAULT now(),
  
  -- Custom permissions (overrides role defaults)
  custom_permissions jsonb DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(team_id, user_id)
);

-- 4. Team Invitations Table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Invitation details
  email text NOT NULL,
  role text NOT NULL REFERENCES team_roles(role) DEFAULT 'member',
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Invitation status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Expiry
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  
  -- Response tracking
  responded_at timestamptz,
  response_message text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(team_id, email, status) -- Prevent duplicate pending invitations
);

-- 5. Document Storage Table
CREATE TABLE IF NOT EXISTS team_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Document details
  name text NOT NULL,
  description text,
  file_path text NOT NULL, -- Supabase Storage path
  file_size bigint,
  mime_type text,
  
  -- Document metadata
  category text DEFAULT 'general' CHECK (category IN ('general', 'legal', 'financial', 'template', 'contract')),
  tags text[] DEFAULT '{}',
  
  -- Version control
  version integer DEFAULT 1,
  parent_id uuid REFERENCES team_documents(id), -- For versioning
  is_latest boolean DEFAULT true,
  
  -- Access control
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  visibility text DEFAULT 'team' CHECK (visibility IN ('team', 'admin_only', 'private')),
  
  -- OCR and processing
  ocr_status text DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_text text,
  processing_metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(name, '') || ' ' || 
      coalesce(description, '') || ' ' || 
      coalesce(ocr_text, '') || ' ' ||
      array_to_string(coalesce(tags, '{}'), ' ')
    )
  ) STORED
);

-- 6. Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template details
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('legal', 'financial', 'operational', 'marketing')),
  
  -- Template content
  template_data jsonb NOT NULL,
  fields jsonb DEFAULT '[]'::jsonb, -- Dynamic form fields
  
  -- Access control
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  team_id uuid REFERENCES teams(id), -- NULL for global templates
  
  -- Metadata
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Banking Information Table (Secure)
CREATE TABLE IF NOT EXISTS team_banking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Stripe Connect data (encrypted)
  stripe_account_id text UNIQUE,
  stripe_account_status text DEFAULT 'pending',
  
  -- Bank account info (minimal, encrypted)
  account_type text CHECK (account_type IN ('checking', 'savings', 'business')),
  bank_name text,
  account_last_four text, -- Only last 4 digits
  routing_number_hash text, -- Hashed routing number for verification
  
  -- Compliance data
  tax_id_verified boolean DEFAULT false,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed', 'requires_action')),
  compliance_data jsonb DEFAULT '{}'::jsonb,
  
  -- Security
  encryption_key_id text, -- Reference to encryption key
  last_verified_at timestamptz,
  
  -- Metadata
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint
  UNIQUE(team_id)
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS team_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Action details
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  
  -- Actor information
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  
  -- Action metadata
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Context
  ip_address inet,
  user_agent text,
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_search ON teams USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_team_documents_team_id ON team_documents(team_id);
CREATE INDEX IF NOT EXISTS idx_team_documents_uploaded_by ON team_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_team_documents_category ON team_documents(category);
CREATE INDEX IF NOT EXISTS idx_team_documents_search ON team_documents USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_team_documents_latest ON team_documents(team_id, is_latest) WHERE is_latest = true;

CREATE INDEX IF NOT EXISTS idx_team_banking_team_id ON team_banking(team_id);
CREATE INDEX IF NOT EXISTS idx_team_banking_stripe_account ON team_banking(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_team_audit_logs_team_id ON team_audit_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_team_audit_logs_actor ON team_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_team_audit_logs_action ON team_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_team_audit_logs_created_at ON team_audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_banking ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Teams
CREATE POLICY "Users can view teams they are members of" ON teams
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR visibility = 'public'
  );

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for Team Members
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team admins can manage members" ON team_members
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      JOIN team_roles tr ON tm.role = tr.role
      WHERE tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND tr.level >= 80 -- Admin level or higher
    )
  );

-- RLS Policies for Team Documents
CREATE POLICY "Team members can view team documents" ON team_documents
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND (
      visibility = 'team' OR 
      (visibility = 'admin_only' AND team_id IN (
        SELECT tm.team_id FROM team_members tm
        JOIN team_roles tr ON tm.role = tr.role
        WHERE tm.user_id = auth.uid() AND tr.level >= 80
      )) OR
      (visibility = 'private' AND uploaded_by = auth.uid())
    )
  );

CREATE POLICY "Team members can upload documents" ON team_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) AND uploaded_by = auth.uid()
  );

-- RLS Policies for Banking (Highly restricted)
CREATE POLICY "Only team owners and admins can view banking info" ON team_banking
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      JOIN team_roles tr ON tm.role = tr.role
      WHERE tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND tr.level >= 80 -- Admin level or higher
    )
  );

-- RLS Policies for Audit Logs
CREATE POLICY "Team members can view audit logs" ON team_audit_logs
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Functions for team management

-- Function to check team permissions
CREATE OR REPLACE FUNCTION check_team_permission(
  team_uuid uuid,
  user_uuid uuid,
  permission_name text
) RETURNS boolean AS $$
DECLARE
  user_role text;
  role_permissions jsonb;
  custom_permissions jsonb;
BEGIN
  -- Get user's role and custom permissions in the team
  SELECT tm.role, tm.custom_permissions, tr.permissions
  INTO user_role, custom_permissions, role_permissions
  FROM team_members tm
  JOIN team_roles tr ON tm.role = tr.role
  WHERE tm.team_id = team_uuid 
    AND tm.user_id = user_uuid 
    AND tm.status = 'active';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user has 'all' permissions (owner)
  IF role_permissions->>'all' = 'true' THEN
    RETURN true;
  END IF;
  
  -- Check custom permissions first
  IF custom_permissions ? permission_name THEN
    RETURN (custom_permissions->>permission_name)::boolean;
  END IF;
  
  -- Check role permissions
  IF role_permissions ? permission_name THEN
    RETURN (role_permissions->>permission_name)::boolean;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  team_uuid uuid,
  action_name text,
  resource_type_name text,
  resource_uuid uuid DEFAULT NULL,
  old_vals jsonb DEFAULT NULL,
  new_vals jsonb DEFAULT NULL,
  meta jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO team_audit_logs (
    team_id, action, resource_type, resource_id,
    actor_id, old_values, new_values, metadata
  ) VALUES (
    team_uuid, action_name, resource_type_name, resource_uuid,
    auth.uid(), old_vals, new_vals, meta
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION trigger_audit_log() RETURNS trigger AS $$
DECLARE
  team_uuid uuid;
  action_name text;
BEGIN
  -- Determine team_id based on table
  CASE TG_TABLE_NAME
    WHEN 'teams' THEN
      team_uuid := COALESCE(NEW.id, OLD.id);
    WHEN 'team_members' THEN
      team_uuid := COALESCE(NEW.team_id, OLD.team_id);
    WHEN 'team_documents' THEN
      team_uuid := COALESCE(NEW.team_id, OLD.team_id);
    WHEN 'team_banking' THEN
      team_uuid := COALESCE(NEW.team_id, OLD.team_id);
    ELSE
      RETURN COALESCE(NEW, OLD);
  END CASE;
  
  -- Determine action
  CASE TG_OP
    WHEN 'INSERT' THEN action_name := 'created';
    WHEN 'UPDATE' THEN action_name := 'updated';
    WHEN 'DELETE' THEN action_name := 'deleted';
  END CASE;
  
  -- Create audit log
  PERFORM create_audit_log(
    team_uuid,
    action_name,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_teams_changes
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_team_members_changes
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_team_documents_changes
  AFTER INSERT OR UPDATE OR DELETE ON team_documents
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_team_banking_changes
  AFTER INSERT OR UPDATE OR DELETE ON team_banking
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations() RETURNS void AS $$
BEGIN
  UPDATE team_invitations 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to update team member last_active_at
CREATE OR REPLACE FUNCTION update_team_member_activity(team_uuid uuid) RETURNS void AS $$
BEGIN
  UPDATE team_members 
  SET last_active_at = now(), updated_at = now()
  WHERE team_id = team_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_documents_updated_at BEFORE UPDATE ON team_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_banking_updated_at BEFORE UPDATE ON team_banking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();