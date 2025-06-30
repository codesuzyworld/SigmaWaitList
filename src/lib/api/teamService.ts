import { supabase } from '../supabase'

export interface Team {
  id: string
  name: string
  description?: string
  slug: string
  avatar_url?: string
  visibility: 'public' | 'private' | 'invite_only'
  max_members: number
  features: {
    documents: boolean
    banking: boolean
    analytics: boolean
  }
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  status: 'active' | 'inactive' | 'suspended'
  joined_at: string
  invited_by?: string
  last_active_at: string
  custom_permissions: Record<string, boolean>
  created_at: string
  updated_at: string
  
  // Joined data
  user_profile?: {
    name: string
    username?: string
    profile_picture_url?: string
    email?: string
  }
}

export interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: TeamRole
  invited_by: string
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
  token: string
  expires_at: string
  responded_at?: string
  response_message?: string
  created_at: string
  updated_at: string
  
  // Joined data
  team?: Pick<Team, 'id' | 'name' | 'description'>
  inviter?: {
    name: string
    email: string
  }
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface TeamPermissions {
  all?: boolean
  manage_members?: boolean
  manage_settings?: boolean
  manage_documents?: boolean
  view_analytics?: boolean
  create_documents?: boolean
  edit_own_documents?: boolean
  view_documents?: boolean
  manage_banking?: boolean
  view_banking?: boolean
}

export interface CreateTeamData {
  name: string
  description?: string
  visibility?: Team['visibility']
  max_members?: number
}

export interface InviteTeamMemberData {
  email: string
  role: TeamRole
  message?: string
}

export class TeamService {
  /**
   * Create a new team
   */
  static async createTeam(data: CreateTeamData): Promise<{ team: Team | null; error: string | null }> {
    try {
      const slug = this.generateSlug(data.name)
      
      const { data: team, error } = await supabase
        .from('teams')
        .insert([{
          name: data.name,
          description: data.description,
          slug,
          visibility: data.visibility || 'private',
          max_members: data.max_members || 10,
          owner_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) throw error

      // Add owner as team member
      await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: team.owner_id,
          role: 'owner',
          status: 'active'
        }])

      return { team, error: null }
    } catch (error: any) {
      console.error('Error creating team:', error)
      return { team: null, error: error.message }
    }
  }

  /**
   * Get teams for current user
   */
  static async getUserTeams(): Promise<{ teams: Team[]; error: string | null }> {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner(role, status)
        `)
        .eq('team_members.user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('team_members.status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { teams: teams || [], error: null }
    } catch (error: any) {
      console.error('Error fetching user teams:', error)
      return { teams: [], error: error.message }
    }
  }

  /**
   * Get team by ID with member check
   */
  static async getTeam(teamId: string): Promise<{ team: Team | null; error: string | null }> {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (error) throw error

      return { team, error: null }
    } catch (error: any) {
      console.error('Error fetching team:', error)
      return { team: null, error: error.message }
    }
  }

  /**
   * Get team members
   */
  static async getTeamMembers(teamId: string): Promise<{ members: TeamMember[]; error: string | null }> {
    try {
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user_profiles!inner(name, username, profile_picture_url),
          profiles!inner(email)
        `)
        .eq('team_id', teamId)
        .eq('status', 'active')
        .order('joined_at', { ascending: true })

      if (error) throw error

      const formattedMembers = members?.map(member => ({
        ...member,
        user_profile: {
          name: member.user_profiles?.name || '',
          username: member.user_profiles?.username,
          profile_picture_url: member.user_profiles?.profile_picture_url,
          email: member.profiles?.email || ''
        }
      })) || []

      return { members: formattedMembers, error: null }
    } catch (error: any) {
      console.error('Error fetching team members:', error)
      return { members: [], error: error.message }
    }
  }

  /**
   * Invite user to team
   */
  static async inviteTeamMember(
    teamId: string, 
    data: InviteTeamMemberData
  ): Promise<{ invitation: TeamInvitation | null; error: string | null }> {
    try {
      // Check if user has permission to invite
      const canInvite = await this.checkPermission(teamId, 'manage_members')
      if (!canInvite) {
        return { invitation: null, error: 'Insufficient permissions to invite members' }
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', data.email) // This would need to be resolved to user_id
        .eq('status', 'active')
        .single()

      if (existingMember) {
        return { invitation: null, error: 'User is already a team member' }
      }

      // Check for existing pending invitation
      const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('team_id', teamId)
        .eq('email', data.email.toLowerCase())
        .eq('status', 'pending')
        .single()

      if (existingInvitation) {
        return { invitation: null, error: 'Invitation already sent to this email' }
      }

      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert([{
          team_id: teamId,
          email: data.email.toLowerCase(),
          role: data.role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select(`
          *,
          teams(id, name, description),
          profiles!team_invitations_invited_by_fkey(name, email)
        `)
        .single()

      if (error) throw error

      // TODO: Send invitation email
      
      return { invitation, error: null }
    } catch (error: any) {
      console.error('Error inviting team member:', error)
      return { invitation: null, error: error.message }
    }
  }

  /**
   * Accept team invitation
   */
  static async acceptInvitation(token: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Get invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (inviteError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' }
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('team_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id)
        
        return { success: false, error: 'Invitation has expired' }
      }

      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        return { success: false, error: 'User not authenticated' }
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: invitation.team_id,
          user_id: userId,
          role: invitation.role,
          invited_by: invitation.invited_by,
          status: 'active'
        }])

      if (memberError) throw memberError

      // Update invitation status
      await supabase
        .from('team_invitations')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      return { success: true, error: null }
    } catch (error: any) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Check if user has specific permission in team
   */
  static async checkPermission(teamId: string, permission: keyof TeamPermissions): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_team_permission', {
          team_uuid: teamId,
          user_uuid: (await supabase.auth.getUser()).data.user?.id,
          permission_name: permission
        })

      if (error) throw error

      return data || false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Get user's role in team
   */
  static async getUserRole(teamId: string): Promise<{ role: TeamRole | null; error: string | null }> {
    try {
      const { data: member, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'active')
        .single()

      if (error) throw error

      return { role: member?.role || null, error: null }
    } catch (error: any) {
      console.error('Error getting user role:', error)
      return { role: null, error: error.message }
    }
  }

  /**
   * Update team member role
   */
  static async updateMemberRole(
    teamId: string, 
    userId: string, 
    newRole: TeamRole
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Check permission
      const canManage = await this.checkPermission(teamId, 'manage_members')
      if (!canManage) {
        return { success: false, error: 'Insufficient permissions to update member roles' }
      }

      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) throw error

      return { success: true, error: null }
    } catch (error: any) {
      console.error('Error updating member role:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove team member
   */
  static async removeMember(teamId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Check permission
      const canManage = await this.checkPermission(teamId, 'manage_members')
      if (!canManage) {
        return { success: false, error: 'Insufficient permissions to remove members' }
      }

      // Cannot remove team owner
      const { data: member } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

      if (member?.role === 'owner') {
        return { success: false, error: 'Cannot remove team owner' }
      }

      const { error } = await supabase
        .from('team_members')
        .update({ status: 'inactive' })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, error: null }
    } catch (error: any) {
      console.error('Error removing member:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Leave team
   */
  static async leaveTeam(teamId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if user is owner
      const { data: member } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

      if (member?.role === 'owner') {
        return { success: false, error: 'Team owner cannot leave. Transfer ownership first.' }
      }

      const { error } = await supabase
        .from('team_members')
        .update({ status: 'inactive' })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, error: null }
    } catch (error: any) {
      console.error('Error leaving team:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update team activity for current user
   */
  static async updateActivity(teamId: string): Promise<void> {
    try {
      await supabase.rpc('update_team_member_activity', {
        team_uuid: teamId
      })
    } catch (error) {
      console.error('Error updating team activity:', error)
    }
  }

  /**
   * Generate URL-friendly slug from team name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 8)
  }

  /**
   * Clean up expired invitations
   */
  static async cleanupExpiredInvitations(): Promise<void> {
    try {
      await supabase.rpc('cleanup_expired_invitations')
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error)
    }
  }
}