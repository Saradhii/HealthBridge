'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api'
import { type Role } from '@/lib/types'
import { toast } from 'sonner'
import { RolesTable } from './components/roles-table'

function RolesTableSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  )
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRoles()
      setRoles(response.roles)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => router.push('/dashboard/users')}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h2 className='text-2xl font-bold tracking-tight'>Role Management</h2>
          </div>
          <p className='text-muted-foreground'>
            Manage system and custom roles with their permissions.
          </p>
        </div>
        <Button className='space-x-1' onClick={() => router.push('/dashboard/users/roles/new')}>
          <span>Create Custom Role</span> <Plus size={18} />
        </Button>
      </div>

      {loading ? (
        <RolesTableSkeleton />
      ) : (
        <RolesTable data={roles} />
      )}
    </div>
  )
}
