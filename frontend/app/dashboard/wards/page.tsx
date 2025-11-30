'use client'

import { useEffect, useState } from 'react'
import { WardsDialogs } from './components/wards-dialogs'
import { WardsPrimaryButtons } from './components/wards-primary-buttons'
import { WardsProvider } from './components/wards-provider'
import { WardCard } from './components/ward-card'
import { WardsSkeleton } from './components/wards-skeleton'
import { type Ward } from './data/schema'
import { apiClient } from '@/lib/api'
import { type WardFromDB } from '@/lib/types'

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWards = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getWards()

      // Transform backend data to frontend schema
      const transformedWards: Ward[] = response.wards.map((ward: WardFromDB) => ({
        id: ward.id,
        tenantId: ward.tenantId,
        name: ward.name,
        department: ward.department || null,
        floor: ward.floor || null,
        totalBeds: ward.totalBeds,
        occupiedBeds: ward.occupiedBeds,
        createdAt: new Date(ward.createdAt),
        updatedAt: new Date(ward.updatedAt),
        rooms: ward.rooms.map(room => ({
          id: room.id,
          wardId: room.wardId,
          roomNumber: room.roomNumber,
          bedType: room.bedType,
          status: room.status,
          currentPatient: room.currentPatient ? {
            patientId: room.currentPatient.patientId,
            patientName: room.currentPatient.patientName,
            checkIn: new Date(room.currentPatient.checkIn),
            expectedCheckOut: room.currentPatient.expectedCheckOut
              ? new Date(room.currentPatient.expectedCheckOut)
              : null,
          } : null,
          createdAt: new Date(room.createdAt),
          updatedAt: new Date(room.updatedAt),
        })),
      }))

      setWards(transformedWards)
    } catch (err) {
      console.error('Failed to fetch wards:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch wards')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWards()
  }, [])

  return (
    <WardsProvider refreshWards={fetchWards}>
      <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Wards & Beds Management</h2>
            <p className='text-muted-foreground'>
              Manage hospital wards, rooms, and patient assignments.
            </p>
          </div>
          <WardsPrimaryButtons />
        </div>

        {isLoading ? (
          <WardsSkeleton />
        ) : error ? (
          <div className='flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-8'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : wards.length === 0 ? (
          <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed p-8 sm:p-12'>
            <div className='flex flex-col items-center gap-2 text-center'>
              <h3 className='text-lg font-semibold'>No wards found</h3>
              <p className='text-sm text-muted-foreground max-w-sm'>
                Get started by creating your first ward. You can then add rooms and assign patients.
              </p>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-4 sm:gap-6'>
            {wards.map((ward) => (
              <WardCard key={ward.id} ward={ward} />
            ))}
          </div>
        )}
      </div>

      <WardsDialogs wards={wards} />
    </WardsProvider>
  )
}
