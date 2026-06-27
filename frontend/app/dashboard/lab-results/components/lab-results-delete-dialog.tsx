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
import { type LabResult } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useLabResults } from './lab-results-provider'

type LabResultsDeleteDialogProps = {
  currentRow: LabResult
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LabResultsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: LabResultsDeleteDialogProps) {
  const { refresh } = useLabResults()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await apiClient.deleteLabResult(currentRow.id)
      toast.success('Lab result deleted successfully')
      refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete lab result')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const patientName = `${currentRow.patient.firstName} ${currentRow.patient.lastName}`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the{' '}
            <span className='font-semibold text-foreground'>
              {currentRow.testName}
            </span>{' '}
            lab result for{' '}
            <span className='font-semibold text-foreground'>{patientName}</span>.
            This action cannot be undone.
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
