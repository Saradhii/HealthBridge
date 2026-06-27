'use client'

import { useEffect, useState, useCallback } from 'react'
import { ProceduresDialogs } from './components/procedures-dialogs'
import { ProceduresPrimaryButtons } from './components/procedures-primary-buttons'
import { ProceduresProvider } from './components/procedures-provider'
import { ProceduresTable } from './components/procedures-table'
import { DataTableSkeleton } from '@/components/data-table'
import { apiClient } from '@/lib/api'
import { type GetProceduresResponse } from '@/lib/types'
import { type Procedure } from './data/schema'

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [pagination, setPagination] = useState<GetProceduresResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProcedures = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getProcedures({ page, limit })

      const transformed: Procedure[] = response.procedures.map((procedure) => ({
        ...procedure,
        scheduledDate: new Date(procedure.scheduledDate),
        completedDate: procedure.completedDate
          ? new Date(procedure.completedDate)
          : null,
        createdAt: new Date(procedure.createdAt),
        updatedAt: new Date(procedure.updatedAt),
      }))

      setProcedures(transformed)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Failed to fetch procedures:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch procedures')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProcedures(pagination.page, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
  }

  return (
    <ProceduresProvider refresh={() => fetchProcedures(pagination.page, pagination.limit)}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Procedures</h2>
            <p className='text-muted-foreground'>
              Manage medical procedures, scheduling, and patient care.
            </p>
          </div>
          <ProceduresPrimaryButtons />
        </div>
        {isLoading ? (
          <DataTableSkeleton columns={6} />
        ) : error ? (
          <div className='flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-8'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <ProceduresTable
            data={procedures}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <ProceduresDialogs />
    </ProceduresProvider>
  )
}
