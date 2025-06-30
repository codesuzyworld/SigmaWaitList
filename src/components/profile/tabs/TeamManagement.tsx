import React, { useState } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { useTeams } from '../../../hooks/useTeams'
import { useTeam } from '../../../hooks/useTeam'
import { TeamRole } from '../../../lib/api/teamService'
import { 
  Users, 
  Plus, 
  Settings, 
  Crown, 
  Shield, 
  User, 
  Eye, 
  UserPlus,
  UserMinus,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react'

export const TeamManagement: React.FC = () => {
  const { teams, loading: teamsLoading, createTeam, creating } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)

  // Create team form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'public' | 'private' | 'invite_only',
    max_members: 10
  })

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as TeamRole,
    message: ''
  })

  const {
    team,
    members,
    userRole,
    loading: teamLoading,
    error: teamError,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveTeam,
    canManageMembers,
    canManageSettings,
    isOwner
  } = useTeam(selectedTeamId || undefined)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await createTeam(createForm)
    
    if (result.team) {
      setSelectedTeamId(result.team.id)
      setShowCreateForm(false)
      setCreateForm({ name: '', description: '', visibility: 'private', max_members: 10 })
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await inviteMember(inviteForm.email, inviteForm.role, inviteForm.message)
    
    if (result.success) {
      setShowInviteForm(false)
      setInviteForm({ email: '', role: 'member', message: '' })
    }
  }

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
      case 'member': return <User className="w-4 h-4 text-green-500" />
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'text-yellow-500'
      case 'admin': return 'text-blue-500'
      case 'member': return 'text-green-500'
      case 'viewer': return 'text-gray-500'
    }
  }

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#6ad040] animate-spin mx-auto mb-4" />
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl mb-2">
            TEAM MANAGEMENT
          </h2>
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-90">
            Collaborate with your team on business automation
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1">
          <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                  Your Teams
                </h3>
              </div>

              <div className="space-y-3">
                {teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-[#6ad040]/50 mx-auto mb-4" />
                    <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm mb-4">
                      You're not part of any teams yet
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Team
                    </Button>
                  </div>
                ) : (
                  teams.map(team => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedTeamId === team.id
                          ? 'border-[#6ad040] bg-[#6ad040]/10'
                          : 'border-[#6ad040]/30 hover:border-[#6ad040]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#6ad040]/20 flex items-center justify-center">
                          {team.avatar_url ? (
                            <img src={team.avatar_url} alt={team.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-[#6ad040]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                            {team.name}
                          </h4>
                          <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                            {team.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeamId ? (
            <TeamDetails
              team={team}
              members={members}
              userRole={userRole}
              loading={teamLoading}
              error={teamError}
              canManageMembers={canManageMembers()}
              canManageSettings={canManageSettings()}
              isOwner={isOwner()}
              onInviteMember={() => setShowInviteForm(true)}
              onUpdateMemberRole={updateMemberRole}
              onRemoveMember={removeMember}
              onLeaveTeam={leaveTeam}
            />
          ) : (
            <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-[#6ad040]/50 mx-auto mb-4" />
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-2">
                    Select a Team
                  </h3>
                  <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                    Choose a team from the left to view details and manage members
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-black/90 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-5 h-5 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                  Create New Team
                </h3>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                    Team Name *
                  </label>
                  <Input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                    className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                    required
                  />
                </div>

                <div>
                  <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your team's purpose..."
                    rows={3}
                    className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                    Visibility
                  </label>
                  <select
                    value={createForm.visibility}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                  >
                    <option value="private">Private</option>
                    <option value="invite_only">Invite Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-black/40 hover:bg-black/60 text-[#b7ffab] border border-[#6ad040]/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating || !createForm.name.trim()}
                    className="flex-1 bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Team'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-black/90 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-5 h-5 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                  Invite Team Member
                </h3>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                    required
                  />
                </div>

                <div>
                  <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as TeamRole }))}
                    className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                  >
                    <option value="viewer">Viewer - Read-only access</option>
                    <option value="member">Member - Can create and edit documents</option>
                    <option value="admin">Admin - Can manage team settings</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                    Invitation Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 bg-black/40 hover:bg-black/60 text-[#b7ffab] border border-[#6ad040]/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!inviteForm.email.trim()}
                    className="flex-1 bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
                  >
                    Send Invitation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Team Details Component
interface TeamDetailsProps {
  team: any
  members: any[]
  userRole: TeamRole | null
  loading: boolean
  error: string | null
  canManageMembers: boolean
  canManageSettings: boolean
  isOwner: boolean
  onInviteMember: () => void
  onUpdateMemberRole: (userId: string, role: TeamRole) => void
  onRemoveMember: (userId: string) => void
  onLeaveTeam: () => void
}

const TeamDetails: React.FC<TeamDetailsProps> = ({
  team,
  members,
  userRole,
  loading,
  error,
  canManageMembers,
  canManageSettings,
  isOwner,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  onLeaveTeam
}) => {
  if (loading) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#6ad040] animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="font-['Space_Mono'] text-red-400 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!team) return null

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
      case 'member': return <User className="w-4 h-4 text-green-500" />
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Info */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#6ad040]/20 flex items-center justify-center">
                {team.avatar_url ? (
                  <img src={team.avatar_url} alt={team.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Users className="w-8 h-8 text-[#6ad040]" />
                )}
              </div>
              <div>
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-1">
                  {team.name}
                </h3>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm mb-2">
                  {team.description || 'No description available'}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-['Space_Mono'] text-[#b7ffab]/60">
                    Created {new Date(team.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-['Space_Mono'] text-[#b7ffab]/60">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-['Space_Grotesk'] font-bold ${
                    team.visibility === 'public' ? 'bg-green-500/20 text-green-400' :
                    team.visibility === 'private' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {team.visibility.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canManageSettings && (
                <Button className="bg-black/40 hover:bg-black/60 text-[#b7ffab] border border-[#6ad040]/50 text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
              
              {!isOwner && (
                <Button 
                  onClick={onLeaveTeam}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 text-sm"
                >
                  Leave Team
                </Button>
              )}
            </div>
          </div>

          {userRole && (
            <div className="flex items-center gap-2 p-3 bg-[#6ad040]/10 rounded-lg">
              {getRoleIcon(userRole)}
              <span className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                Your role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Team Members ({members.length})
              </h3>
            </div>
            
            {canManageMembers && (
              <Button
                onClick={onInviteMember}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold text-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6ad040]/20 flex items-center justify-center overflow-hidden">
                    {member.user_profile?.profile_picture_url ? (
                      <img 
                        src={member.user_profile.profile_picture_url} 
                        alt={member.user_profile.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-5 h-5 text-[#6ad040]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                        {member.user_profile?.name || 'Unknown User'}
                      </p>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                      {member.user_profile?.email}
                    </p>
                    <p className="font-['Space_Mono'] text-[#b7ffab]/50 text-xs">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {canManageMembers && member.role !== 'owner' && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => onUpdateMemberRole(member.user_id, e.target.value as TeamRole)}
                      className="h-8 px-2 bg-black/40 border border-[#6ad040]/50 rounded text-[#b7ffab] text-xs focus:border-[#6ad040] focus:outline-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    
                    <Button
                      onClick={() => onRemoveMember(member.user_id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 text-xs px-2 py-1"
                    >
                      <UserMinus className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}