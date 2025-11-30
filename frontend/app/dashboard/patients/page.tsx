'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { PatientsTable } from './components/patients-table'
import { UsersTableSkeleton } from './components/users-table-skeleton'
import { apiClient } from '@/lib/api'
import { type PatientFromDB, type GetPatientsResponse } from '@/lib/types'
import { type Patient } from './data/schema'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [pagination, setPagination] = useState<GetPatientsResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    bloodGroup: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  })

  // Use ref to track latest filter and pagination values to avoid stale closures
  const filtersRef = useRef(filters)
  const paginationRef = useRef(pagination)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  const fetchPatients = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
    bloodGroup?: string;
    isActive?: boolean | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    try {
      setIsLoading(true)
      setError(null)

      // Use refs to get the latest filter and pagination values
      const currentFilters = filtersRef.current
      const currentPagination = paginationRef.current

      const requestParams = {
        page: params.page || currentPagination.page,
        limit: params.limit || currentPagination.limit,
        search: params.search !== undefined ? params.search : currentFilters.search,
        gender: params.gender !== undefined ? params.gender : currentFilters.gender,
        bloodGroup: params.bloodGroup !== undefined ? params.bloodGroup : currentFilters.bloodGroup,
        isActive: params.isActive !== undefined ? params.isActive : (currentFilters.isActive === '' ? undefined : currentFilters.isActive === 'true'),
        sortBy: params.sortBy !== undefined ? params.sortBy : currentFilters.sortBy,
        sortOrder: params.sortOrder !== undefined ? params.sortOrder : currentFilters.sortOrder,
      }

      const response = await apiClient.getPatients(requestParams)

      const transformedPatients: Patient[] = response.patients.map((patient) => ({
        ...patient,
        dateOfBirth: new Date(patient.dateOfBirth),
        createdAt: new Date(patient.createdAt),
        updatedAt: new Date(patient.updatedAt),
        status: patient.isActive ? ('active' as const) : ('inactive' as const),
      }))

      setPatients(transformedPatients)
      setPagination(prev => ({
        ...prev,
        page: requestParams.page,
        limit: requestParams.limit,
        ...response.pagination
      }))
    } catch (err) {
      console.error('Failed to fetch patients:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch patients')
    } finally {
      setIsLoading(false)
    }
  }, []) // Empty deps is safe now because we use refs

  useEffect(() => {
    // Initial fetch only
    fetchPatients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for patient refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchPatients()
    }

    window.addEventListener('patient:refresh', handleRefresh)
    return () => {
      window.removeEventListener('patient:refresh', handleRefresh)
    }
  }, [fetchPatients])

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    // Use ref to get current filters without adding it to dependencies
    const updatedFilters = { ...filtersRef.current, ...newFilters }
    setFilters(updatedFilters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when filters change
    // Immediately fetch with updated filters
    fetchPatients({ page: 1, ...updatedFilters })
  }, [fetchPatients])

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: '',
      gender: '',
      bloodGroup: '',
      isActive: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as 'asc' | 'desc',
    }
    setFilters(defaultFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPatients({ page: 1, ...defaultFilters })
  }, [fetchPatients])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchPatients({ page: newPage })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
    fetchPatients({ page: 1, limit: newPageSize })
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const updatedFilters = { ...filters, sortBy, sortOrder }
    setFilters(updatedFilters)
    fetchPatients({ ...updatedFilters })
  }

  return (
    <UsersProvider refreshUsers={() => fetchPatients()}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Patient Records</h2>
            <p className='text-muted-foreground'>
              Manage patient admissions and medical records.
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
          <PatientsTable
            data={patients}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={handleSortChange}
            isLoading={isLoading}
            filters={filters}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
          />
        )}
      </div>

      <UsersDialogs />
    </UsersProvider>
  )
}
