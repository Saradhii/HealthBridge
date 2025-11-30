'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api'
import { type Role } from '@/lib/types'
import { toast } from 'sonner'
import { RoleForm } from '../../components/role-form'

function EditRolePageSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-10 w-64' />
      <Skeleton className='h-64 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  )
}

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string

  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRole(roleId)

      if (response.role.isSystemRole) {
        toast.error('System roles cannot be edited')
        router.push('/dashboard/users/roles')
        return
      }

      setRole(response.role)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch role')
      router.push('/dashboard/users/roles')
    } finally {
      setLoading(false)
    }
  }, [roleId, router])

  useEffect(() => {
    if (roleId) {
      fetchRole()
    }
  }, [roleId, fetchRole])

  if (loading) {
    return <EditRolePageSkeleton />
  }

  if (!role) {
    return null
  }

  return <RoleForm mode='edit' initialData={role} />
}
