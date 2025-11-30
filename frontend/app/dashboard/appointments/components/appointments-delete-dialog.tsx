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
import { type Appointment } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useAppointments } from './appointments-provider'
import { format } from 'date-fns'

type AppointmentsDeleteDialogProps = {
  currentRow: Appointment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppointmentsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: AppointmentsDeleteDialogProps) {
  const { refreshAppointments } = useAppointments()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await apiClient.deleteAppointment(currentRow.id)
      toast.success('Appointment deleted successfully')
      refreshAppointments()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete appointment')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const patientName = `${currentRow.patient.firstName} ${currentRow.patient.lastName}`
  const appointmentDate = format(
    new Date(currentRow.appointmentDate),
    'MMM dd, yyyy - hh:mm a'
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the appointment for{' '}
            <span className='font-semibold text-foreground'>{patientName}</span>{' '}
            scheduled on{' '}
            <span className='font-semibold text-foreground'>
              {appointmentDate}
            </span>
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
