import { useState, useEffect } from 'react'
import { TeamService, Team, TeamMember, TeamRole } from '../lib/api/teamService'
import { useApp } from '../contexts/AppContext'

export const useTeam = (teamId?: string) => {
  const { user } = useApp()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [userRole, setUserRole] = useState<TeamRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load team data
  const loadTeam = async () => {
    if (!teamId) return

    setLoading(true)
    setError(null)

    try {
      const [teamResult, membersResult, roleResult] = await Promise.all([
        TeamService.getTeam(teamId),
        TeamService.getTeamMembers(teamId),
        TeamService.getUserRole(teamId)
      ])

      if (teamResult.error) {
        setError(teamResult.error)
        return
      }

      if (membersResult.error) {
        setError(membersResult.error)
        return
      }

      setTeam(teamResult.team)
      setMembers(membersResult.members)
      setUserRole(roleResult.role)

      // Update activity
      if (teamId) {
        TeamService.updateActivity(teamId)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Invite member
  const inviteMember = async (email: string, role: TeamRole, message?: string) => {
    if (!teamId) return { success: false, error: 'No team selected' }

    setError(null)
    const result = await TeamService.inviteTeamMember(teamId, { email, role, message })
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  }

  // Update member role
  const updateMemberRole = async (userId: string, newRole: TeamRole) => {
    if (!teamId) return { success: false, error: 'No team selected' }

    setError(null)
    const result = await TeamService.updateMemberRole(teamId, userId, newRole)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    // Reload members to reflect changes
    const membersResult = await TeamService.getTeamMembers(teamId)
    if (!membersResult.error) {
      setMembers(membersResult.members)
    }

    return { success: true, error: null }
  }

  // Remove member
  const removeMember = async (userId: string) => {
    if (!teamId) return { success: false, error: 'No team selected' }

    setError(null)
    const result = await TeamService.removeMember(teamId, userId)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    // Reload members to reflect changes
    const membersResult = await TeamService.getTeamMembers(teamId)
    if (!membersResult.error) {
      setMembers(membersResult.members)
    }

    return { success: true, error: null }
  }

  // Leave team
  const leaveTeam = async () => {
    if (!teamId) return { success: false, error: 'No team selected' }

    setError(null)
    const result = await TeamService.leaveTeam(teamId)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  }

  // Check permission
  const checkPermission = async (permission: string) => {
    if (!teamId) return false
    return await TeamService.checkPermission(teamId, permission as any)
  }

  // Helper to check if user can perform actions
  const canManageMembers = () => {
    return userRole === 'owner' || userRole === 'admin'
  }

  const canManageSettings = () => {
    return userRole === 'owner' || userRole === 'admin'
  }

  const canViewDocuments = () => {
    return userRole !== null
  }

  const canCreateDocuments = () => {
    return userRole === 'owner' || userRole === 'admin' || userRole === 'member'
  }

  const isOwner = () => {
    return userRole === 'owner'
  }

  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'owner'
  }

  // Load team when teamId changes
  useEffect(() => {
    if (teamId && user) {
      loadTeam()
    }
  }, [teamId, user?.id])

  return {
    team,
    members,
    userRole,
    loading,
    error,
    loadTeam,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveTeam,
    checkPermission,
    canManageMembers,
    canManageSettings,
    canViewDocuments,
    canCreateDocuments,
    isOwner,
    isAdmin
  }
}