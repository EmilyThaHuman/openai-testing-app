import { useEffect, useState } from 'react'
import { supabase, databaseUtils } from '@/lib/supabase/client'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    async function fetchProfile() {
      try {
        const { data, error } = await databaseUtils.getProfile(userId)
        if (error) throw error
        setProfile(data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, loading, error }
}

export function useWorkspaces(userId) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const workspacesSubscription = supabase
      .from('workspaces')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .on('*', payload => {
        if (payload.eventType === 'INSERT') {
          setWorkspaces(current => [payload.new, ...current])
        }
        if (payload.eventType === 'DELETE') {
          setWorkspaces(current => 
            current.filter(workspace => workspace.id !== payload.old.id)
          )
        }
        if (payload.eventType === 'UPDATE') {
          setWorkspaces(current =>
            current.map(workspace =>
              workspace.id === payload.new.id ? payload.new : workspace
            )
          )
        }
      })
      .subscribe()

    return () => {
      workspacesSubscription.unsubscribe()
    }
  }, [userId])

  return { workspaces, loading, error }
} 