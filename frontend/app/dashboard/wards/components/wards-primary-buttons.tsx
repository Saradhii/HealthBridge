'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWards } from './wards-provider'

export function WardsPrimaryButtons() {
  const { setOpen } = useWards()

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button onClick={() => setOpen('add-ward')}>
        <Plus className='mr-2 h-4 w-4' />
        Add Ward
      </Button>
    </div>
  )
}
