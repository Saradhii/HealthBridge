'use client'

import { useEffect, useState, useCallback } from 'react'
import { AppointmentsDialogs } from './components/appointments-dialogs'
import { AppointmentsPrimaryButtons } from './components/appointments-primary-buttons'
import { AppointmentsProvider } from './components/appointments-provider'
import { AppointmentsTable } from './components/appointments-table'
import { AppointmentsTableSkeleton } from './components/appointments-table-skeleton'
import { apiClient } from '@/lib/api'
import { type AppointmentFromDB, type GetAppointmentsResponse } from '@/lib/types'
import { type Appointment } from './data/schema'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pagination, setPagination] = useState<GetAppointmentsResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getAppointments({
        page,
        limit,
      })

      const transformedAppointments: Appointment[] = response.appointments.map((appointment) => ({
        ...appointment,
        appointmentDate: new Date(appointment.appointmentDate),
        createdAt: new Date(appointment.createdAt),
        updatedAt: new Date(appointment.updatedAt),
      }))

      setAppointments(transformedAppointments)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments(pagination.page, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newPageSize }))
  }

  return (
    <AppointmentsProvider refreshAppointments={() => fetchAppointments(pagination.page, pagination.limit)}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Appointment Management</h2>
            <p className='text-muted-foreground'>
              Schedule and manage patient appointments.
            </p>
          </div>
          <AppointmentsPrimaryButtons />
        </div>
        {isLoading ? (
          <AppointmentsTableSkeleton />
        ) : error ? (
          <div className='flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-8'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <AppointmentsTable
            data={appointments}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        )}
      </div>

      <AppointmentsDialogs />
    </AppointmentsProvider>
  )
}
