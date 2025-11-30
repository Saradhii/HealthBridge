'use client'

import { useEffect, useState, useCallback } from 'react'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { UsersTableSkeleton } from './components/users-table-skeleton'
import { apiClient } from '@/lib/api'
import { type GetUsersResponse } from '@/lib/types'
import { type User } from './data/schema'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<GetUsersResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getUsers({
        page,
        limit,
      })

      // Transform API response to match UI schema
      const transformedUsers: User[] = response.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department || undefined,
        specialization: user.specialization || undefined,
        shift: user.shift || undefined,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        forcePasswordChange: user.forcePasswordChange,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        roles: user.roles,
        status: user.isActive ? ('active' as const) : ('inactive' as const),
        tenantId: (user as any).tenantId,
      } as unknown as User))

      setUsers(transformedUsers)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(pagination.page, pagination.limit)
  }, [fetchUsers, pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
  }

  return (
    <UsersProvider refreshUsers={() => fetchUsers(pagination.page, pagination.limit)}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User Management</h2>
            <p className='text-muted-foreground'>
              Manage hospital staff and their access permissions.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        {isLoading ? (
          <UsersTableSkeleton />
        ) : error ? (
          <div className='flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-8'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <UsersTable
            data={users}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        )}
      </div>

      <UsersDialogs />
    </UsersProvider>
  )
}
