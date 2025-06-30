import { useState, useEffect } from 'react'
import { TeamService, Team, CreateTeamData } from '../lib/api/teamService'
import { useApp } from '../contexts/AppContext'

export const useTeams = () => {
  const { user } = useApp()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Load user's teams
  const loadTeams = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const result = await TeamService.getUserTeams()
      
      if (result.error) {
        setError(result.error)
        return
      }

      setTeams(result.teams)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new team
  const createTeam = async (data: CreateTeamData) => {
    setCreating(true)
    setError(null)

    try {
      const result = await TeamService.createTeam(data)
      
      if (result.error) {
        setError(result.error)
        return { team: null, error: result.error }
      }

      // Add new team to local state
      if (result.team) {
        setTeams(prev => [result.team!, ...prev])
      }

      return { team: result.team, error: null }
    } catch (err: any) {
      setError(err.message)
      return { team: null, error: err.message }
    } finally {
      setCreating(false)
    }
  }

  // Refresh teams list
  const refreshTeams = () => {
    loadTeams()
  }

  // Get team by ID from loaded teams
  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id === teamId) || null
  }

  // Load teams when user changes
  useEffect(() => {
    if (user) {
      loadTeams()
    } else {
      setTeams([])
    }
  }, [user?.id])

  return {
    teams,
    loading,
    error,
    creating,
    loadTeams,
    createTeam,
    refreshTeams,
    getTeamById
  }
}