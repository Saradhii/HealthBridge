'use client'

import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePatients } from './patients-provider'

export function PatientsPrimaryButtons() {
  const { setOpen } = usePatients()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>Quick Admit</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Register Patient</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
