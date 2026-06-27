'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLabResults } from './lab-results-provider'

export function LabResultsPrimaryButtons() {
  const { setOpen } = useLabResults()

  return (
    <div className='flex items-center gap-2'>
      <Button onClick={() => setOpen('add')} size='sm' className='h-8'>
        <Plus className='mr-2 h-4 w-4' />
        New Lab Result
      </Button>
    </div>
  )
}
