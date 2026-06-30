'use client'

import { useEffect, useState, useCallback } from 'react'
import { PrescriptionsDialogs } from './components/prescriptions-dialogs'
import { PrescriptionsPrimaryButtons } from './components/prescriptions-primary-buttons'
import { PrescriptionsProvider } from './components/prescriptions-provider'
import { PrescriptionsTable } from './components/prescriptions-table'
import { DataTableSkeleton } from '@/components/data-table'
import { apiClient } from '@/lib/api'
import { DataLoadError } from '@/components/data-load-error'
import { type GetPrescriptionsResponse } from '@/lib/types'
import { type Prescription } from './data/schema'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [pagination, setPagination] = useState<GetPrescriptionsResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrescriptions = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getPrescriptions({ page, limit })

      const transformed: Prescription[] = response.prescriptions.map((prescription) => ({
        ...prescription,
        issuedDate: new Date(prescription.issuedDate),
        createdAt: new Date(prescription.createdAt),
        updatedAt: new Date(prescription.updatedAt),
      }))

      setPrescriptions(transformed)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch prescriptions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrescriptions(pagination.page, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
  }

  return (
    <PrescriptionsProvider refresh={() => fetchPrescriptions(pagination.page, pagination.limit)}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Prescriptions</h2>
            <p className='text-muted-foreground'>
              Manage patient medications and prescriptions.
            </p>
          </div>
          <PrescriptionsPrimaryButtons />
        </div>
        {isLoading ? (
          <DataTableSkeleton columns={6} />
        ) : error ? (
          <DataLoadError onRetry={() => fetchPrescriptions(pagination.page, pagination.limit)} />
        ) : (
          <PrescriptionsTable
            data={prescriptions}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <PrescriptionsDialogs />
    </PrescriptionsProvider>
  )
}
