'use client'

import { useEffect, useState, useCallback } from 'react'
import { DoctorsDialogs } from './components/doctors-dialogs'
import { DoctorsPrimaryButtons } from './components/doctors-primary-buttons'
import { DoctorsProvider } from './components/doctors-provider'
import { DoctorsTable } from './components/doctors-table'
import { DataTableSkeleton } from '@/components/data-table'
import { apiClient } from '@/lib/api'
import { type GetUsersResponse } from '@/lib/types'
import { type User } from './data/schema'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<User[]>([])
  const [pagination, setPagination] = useState<GetUsersResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctors = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getUsers({
        page,
        limit,
        roleSlug: 'doctor', // Filter for doctors only
      })

      // Transform API response to match UI schema (doctors are a filtered users view)
      const transformedDoctors: User[] = response.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        specialization: user.specialization,
        shift: user.shift,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        forcePasswordChange: user.forcePasswordChange,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        roles: user.roles,
        status: user.isActive ? ('active' as const) : ('inactive' as const),
      }))

      setDoctors(transformedDoctors)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDoctors(pagination.page, pagination.limit)
  }, [fetchDoctors, pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
  }

  return (
    <DoctorsProvider refresh={() => fetchDoctors(pagination.page, pagination.limit)}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Doctor Management</h2>
            <p className='text-muted-foreground'>
              Manage medical practitioners and their specializations.
            </p>
          </div>
          <DoctorsPrimaryButtons />
        </div>
        {isLoading ? (
          <DataTableSkeleton columns={7} />
        ) : error ? (
          <div className='flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-8'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <DoctorsTable
            data={doctors}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <DoctorsDialogs />
    </DoctorsProvider>
  )
}