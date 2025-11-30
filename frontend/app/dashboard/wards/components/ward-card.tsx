'use client'

import { BedDouble, Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type Ward } from '../data/schema'
import { RoomItem } from './room-item'
import { useWards } from './wards-provider'

type WardCardProps = {
  ward: Ward
}

export function WardCard({ ward }: WardCardProps) {
  const { setOpen, setCurrentWard, setCurrentRoom } = useWards()

  const occupancyRate = ward.totalBeds > 0
    ? Math.round((ward.occupiedBeds / ward.totalBeds) * 100)
    : 0

  const handleAddRoom = () => {
    setCurrentWard(ward)
    setCurrentRoom(null)
    setOpen('add-room')
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          {/* Left side - Ward info */}
          <div className='flex items-start gap-3 flex-1 min-w-0'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
              <BedDouble className='h-5 w-5 text-primary' />
            </div>
            <div className='flex-1 min-w-0 space-y-2'>
              <div>
                <CardTitle className='truncate'>{ward.name}</CardTitle>
                <CardDescription className='flex items-center gap-2 mt-1 flex-wrap'>
                  {ward.department && (
                    <>
                      <span className='truncate'>{ward.department}</span>
                      {ward.floor && <span>•</span>}
                    </>
                  )}
                  {ward.floor && <span className='truncate'>{ward.floor}</span>}
                </CardDescription>
              </div>

              {/* Compact progress bar */}
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Progress value={occupancyRate} className='h-1 w-32' />
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>
                    Rooms: {ward.occupiedBeds}/{ward.totalBeds} beds
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Add Room button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleAddRoom}
            className='shrink-0'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Room
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Rooms grid - always visible */}
        {ward.rooms.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
            {ward.rooms.map((room) => (
              <RoomItem key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border border-dashed p-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              No rooms in this ward yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
