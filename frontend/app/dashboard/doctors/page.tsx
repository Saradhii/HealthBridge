'use client'

import { useEffect, useState, useCallback } from 'react'
import { DoctorsDialogs } from './components/doctors-dialogs'
import { DoctorsPrimaryButtons } from './components/doctors-primary-buttons'
import { DoctorsProvider } from './components/doctors-provider'
import { DoctorsTable } from './components/doctors-table'
import { DoctorsTableSkeleton } from './components/doctors-table-skeleton'
import { apiClient } from '@/lib/api'
import { type User, type GetUsersResponse } from '@/lib/types'

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

      // Transform API response to match UI schema
      const transformedDoctors: User[] = response.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department || undefined,
        specialization: user.specialization || undefined,
        shift: user.shift || undefined,
        tenantId: user.tenantId || '',
        roles: user.roles?.map(role => role.name || role.slug || '') || [],
        forcePasswordChange: user.forcePasswordChange,
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
    <DoctorsProvider refreshDoctors={() => fetchDoctors(pagination.page, pagination.limit)}>
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
          <DoctorsTableSkeleton />
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
            isLoading={isLoading}
          />
        )}
      </div>

      <DoctorsDialogs />
    </DoctorsProvider>
  )
}