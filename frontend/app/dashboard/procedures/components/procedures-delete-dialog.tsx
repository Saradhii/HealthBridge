'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { type Procedure } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useProcedures } from './procedures-provider'
import { format } from 'date-fns'

type ProceduresDeleteDialogProps = {
  currentRow: Procedure
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProceduresDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: ProceduresDeleteDialogProps) {
  const { refresh } = useProcedures()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await apiClient.deleteProcedure(currentRow.id)
      toast.success('Procedure deleted successfully')
      refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete procedure')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const patientName = `${currentRow.patient.firstName} ${currentRow.patient.lastName}`
  const scheduledDate = format(
    new Date(currentRow.scheduledDate),
    'MMM dd, yyyy'
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the{' '}
            <span className='font-semibold text-foreground'>
              {currentRow.name}
            </span>{' '}
            procedure for{' '}
            <span className='font-semibold text-foreground'>{patientName}</span>{' '}
            scheduled on{' '}
            <span className='font-semibold text-foreground'>{scheduledDate}</span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
