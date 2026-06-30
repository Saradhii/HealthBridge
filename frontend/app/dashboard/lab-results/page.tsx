'use client'

import { useEffect, useState, useCallback } from 'react'
import { LabResultsDialogs } from './components/lab-results-dialogs'
import { LabResultsPrimaryButtons } from './components/lab-results-primary-buttons'
import { LabResultsProvider } from './components/lab-results-provider'
import { LabResultsTable } from './components/lab-results-table'
import { DataTableSkeleton } from '@/components/data-table'
import { apiClient } from '@/lib/api'
import { DataLoadError } from '@/components/data-load-error'
import { type GetLabResultsResponse } from '@/lib/types'
import { type LabResult } from './data/schema'

export default function LabResultsPage() {
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [pagination, setPagination] = useState<GetLabResultsResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabResults = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getLabResults({ page, limit })

      const transformed: LabResult[] = response.labResults.map((labResult) => ({
        ...labResult,
        orderedDate: new Date(labResult.orderedDate),
        resultDate: labResult.resultDate ? new Date(labResult.resultDate) : null,
        createdAt: new Date(labResult.createdAt),
        updatedAt: new Date(labResult.updatedAt),
      }))

      setLabResults(transformed)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Failed to fetch lab results:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch lab results')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLabResults(pagination.page, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
  }

  return (
    <LabResultsProvider refresh={() => fetchLabResults(pagination.page, pagination.limit)}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Lab Results</h2>
            <p className='text-muted-foreground'>
              Access and manage patient laboratory test results.
            </p>
          </div>
          <LabResultsPrimaryButtons />
        </div>
        {isLoading ? (
          <DataTableSkeleton columns={6} />
        ) : error ? (
          <DataLoadError onRetry={() => fetchLabResults(pagination.page, pagination.limit)} />
        ) : (
          <LabResultsTable
            data={labResults}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <LabResultsDialogs />
    </LabResultsProvider>
  )
}
