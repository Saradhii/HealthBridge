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
import { type Prescription } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { usePrescriptions } from './prescriptions-provider'
import { format } from 'date-fns'

type PrescriptionsDeleteDialogProps = {
  currentRow: Prescription
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrescriptionsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: PrescriptionsDeleteDialogProps) {
  const { refresh } = usePrescriptions()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await apiClient.deletePrescription(currentRow.id)
      toast.success('Prescription deleted successfully')
      refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete prescription')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const patientName = `${currentRow.patient.firstName} ${currentRow.patient.lastName}`
  const issuedDate = format(new Date(currentRow.issuedDate), 'MMM dd, yyyy')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the prescription for{' '}
            <span className='font-semibold text-foreground'>{patientName}</span>{' '}
            issued on{' '}
            <span className='font-semibold text-foreground'>{issuedDate}</span>.
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
