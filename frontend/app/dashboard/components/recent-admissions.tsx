'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { RecentAdmission } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface RecentAdmissionsProps {
  admissions: RecentAdmission[]
  isLoading: boolean
}

export function RecentAdmissions({ admissions, isLoading }: RecentAdmissionsProps) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground text-sm'>Loading...</p>
      </div>
    )
  }

  if (!admissions || admissions.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground text-sm'>No recent admissions</p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className='space-y-8'>
      {admissions.map((admission) => (
        <div key={admission.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>{getInitials(admission.patientName)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {admission.patientName}
              </p>
              <p className='text-muted-foreground text-sm'>
                {admission.ward} - {admission.department}
              </p>
            </div>
            <div className='text-muted-foreground text-sm'>
              {formatDistanceToNow(new Date(admission.checkIn), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
