'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type { Role } from '@/lib/types'

interface UseRolesReturn {
  roles: Role[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getRoles()
      setRoles(response.roles)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
  }
}