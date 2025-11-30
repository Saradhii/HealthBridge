'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { apiClient } from '@/lib/api'
import { type Patient } from '../data/schema'
import { usePatients } from './users-provider'

type PatientDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Patient
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: PatientDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { refreshUsers } = usePatients()

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await apiClient.deletePatient(currentRow.id)
      onOpenChange(false)
      refreshUsers()
      toast.success(`Patient "${currentRow.firstName} ${currentRow.lastName}" has been deleted successfully`)
    } catch (error) {
      console.error('Failed to delete patient:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete patient')
    } finally {
      setIsDeleting(false)
    }
  }

  const patientName = `${currentRow.firstName} ${currentRow.lastName}`
  const patientInfo = `${currentRow.gender}${currentRow.bloodGroup ? ` - Blood Group: ${currentRow.bloodGroup}` : ''}`

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Patient
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{patientName}</span>?
            <br />
            {patientInfo}
            <br />
            This action will permanently remove this patient from the system. This cannot be undone.
          </p>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
