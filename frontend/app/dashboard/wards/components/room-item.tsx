'use client'

import { useState } from 'react'
import { UserPlus, Pencil, Trash2, UserMinus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { type Room } from '../data/schema'
import { useWards } from './wards-provider'
import { cn } from '@/lib/utils'

type RoomItemProps = {
  room: Room
}

export function RoomItem({ room }: RoomItemProps) {
  const { setOpen, setCurrentRoom, refreshWards } = useWards()
  const [isDischarging, setIsDischarging] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const handleAssignPatient = () => {
    setCurrentRoom(room)
    setOpen('assign-patient')
  }

  const handleEditRoom = () => {
    setCurrentRoom(room)
    setOpen('edit-room')
  }

  const handleDeleteRoom = () => {
    setCurrentRoom(room)
    setOpen('delete-room')
  }

  const handleDischargePatient = async () => {
    if (!room.currentPatient) return

    try {
      setIsDischarging(true)

      await apiClient.dischargePatientFromRoom(room.id)

      toast.success('Patient discharged successfully')
      refreshWards()
    } catch (error) {
      console.error('Failed to discharge patient:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to discharge patient')
    } finally {
      setIsDischarging(false)
    }
  }

  const isOccupied = room.status === 'occupied' && room.currentPatient
  const isVacant = room.status === 'vacant'

  return (
    <div
      className={cn(
        'relative rounded-lg border p-3 transition-all aspect-square flex flex-col',
        isOccupied && 'bg-muted/50',
        isVacant && 'border-dashed cursor-pointer hover:border-primary hover:bg-accent/5',
        room.status === 'maintenance' && 'opacity-50 bg-destructive/5 border-destructive/30'
      )}
      onClick={isVacant ? handleAssignPatient : undefined}
    >
      {/* Room Content */}
      <div className='flex flex-col flex-1 justify-between gap-2'>
        {/* Room Number - Top */}
        <div className='flex items-start justify-between'>
          <p className='font-semibold text-sm truncate'>
            Room {room.roomNumber}
          </p>
          {/* Delete button - always visible */}
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 shrink-0'
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteRoom()
            }}
          >
            <Trash2 className='h-3.5 w-3.5 text-muted-foreground hover:text-destructive' />
          </Button>
        </div>

        {/* Patient Info - Center */}
        {isOccupied && room.currentPatient ? (
          <div className='space-y-1.5 flex-1'>
            <p className='font-medium text-sm truncate'>
              {room.currentPatient.patientName}
            </p>
            <div className='space-y-0.5 text-xs text-muted-foreground'>
              <p className='truncate'>
                <span className='font-medium'>Admitted:</span>
                <br />
                {formatDate(room.currentPatient.checkIn)}
              </p>
              {room.currentPatient.expectedCheckOut && (
                <p className='truncate'>
                  <span className='font-medium'>Discharge:</span>
                  <br />
                  {formatDate(room.currentPatient.expectedCheckOut)}
                </p>
              )}
            </div>
          </div>
        ) : isVacant ? (
          <div className='flex items-center justify-center flex-1'>
            <Badge className='text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'>
              <span className='w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500 mr-1.5' />
              Available
            </Badge>
          </div>
        ) : room.status === 'maintenance' ? (
          <div className='flex items-center justify-center flex-1'>
            <Badge variant='destructive' className='text-xs'>
              Maintenance
            </Badge>
          </div>
        ) : null}

        {/* Action Buttons - Bottom */}
        <div className='flex gap-1.5 mt-auto'>
          {isVacant ? (
            <Button
              size='sm'
              className='w-full h-7 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                handleAssignPatient()
              }}
            >
              <UserPlus className='mr-1.5 h-3.5 w-3.5' />
              Assign Patient
            </Button>
          ) : isOccupied ? (
            <>
              <Button
                size='sm'
                variant='outline'
                className='flex-1 h-7 text-xs'
                onClick={(e) => {
                  e.stopPropagation()
                  handleDischargePatient()
                }}
                disabled={isDischarging}
              >
                <UserMinus className='mr-1.5 h-3.5 w-3.5' />
                {isDischarging ? 'Discharging...' : 'Discharge'}
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='h-7 px-2'
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditRoom()
                }}
              >
                <Pencil className='h-3.5 w-3.5' />
              </Button>
            </>
          ) : (
            <Button
              size='sm'
              variant='outline'
              className='w-full h-7 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                handleEditRoom()
              }}
            >
              <Pencil className='mr-1.5 h-3.5 w-3.5' />
              Edit Room
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
