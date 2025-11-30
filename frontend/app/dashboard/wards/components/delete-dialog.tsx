'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { type Ward, type Room } from '../data/schema'
import { useWards } from './wards-provider'

type DeleteDialogProps = {
  type: 'ward' | 'room'
  item: Ward | Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDialog({
  type,
  item,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const { refreshWards } = useWards()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!item) return

    try {
      setIsDeleting(true)

      if (type === 'ward') {
        await apiClient.deleteWard(item.id)
        toast.success('Ward deleted successfully')
      } else {
        await apiClient.deleteRoom(item.id)
        toast.success('Room deleted successfully')
      }

      onOpenChange(false)
      refreshWards()
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to delete ${type}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const getItemName = () => {
    if (!item) return ''
    if (type === 'ward') {
      return (item as Ward).name
    }
    return `Room ${(item as Room).roomNumber}`
  }

  const getDescription = () => {
    if (type === 'ward') {
      return 'This will permanently delete this ward and all associated rooms. This action cannot be undone.'
    }
    return 'This will permanently delete this room. This action cannot be undone.'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            Delete {type === 'ward' ? 'Ward' : 'Room'}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{getItemName()}</span>?
          </p>
        </div>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
