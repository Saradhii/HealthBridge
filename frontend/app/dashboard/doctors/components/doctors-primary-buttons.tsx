'use client'

import { MailPlus, UserPlus, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDoctors } from './doctors-provider'

export function DoctorsPrimaryButtons() {
  const { setOpen } = useDoctors()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>Invite Doctor</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Doctor</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}