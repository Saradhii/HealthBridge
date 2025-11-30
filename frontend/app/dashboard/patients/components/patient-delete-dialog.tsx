'use client'

import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Patient } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

type PatientDeleteDialogProps = {
  currentRow?: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PatientMultiDeleteDialogProps = {
  table: Row<Patient>[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: PatientDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      setIsLoading(true)
      await apiClient.deletePatient(currentRow.id)

      toast.success(`Patient &quot;${currentRow.firstName} ${currentRow.lastName}&quot; deleted successfully`)
      onOpenChange(false)

      // Trigger a refresh by emitting a custom event
      window.dispatchEvent(new CustomEvent('patient:refresh'))
    } catch (error) {
      console.error('Failed to delete patient:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete patient')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete patient &quot;{currentRow?.firstName} {currentRow?.lastName}&quot;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>
            <strong>Patient Information:</strong>
          </p>
          <div className='mt-2 space-y-1 text-sm'>
            {currentRow?.phone && (
              <p><span className='font-medium'>Phone:</span> {currentRow.phone}</p>
            )}
            {currentRow?.email && (
              <p><span className='font-medium'>Email:</span> {currentRow.email}</p>
            )}
            {currentRow?.dateOfBirth && (
              <p>
                <span className='font-medium'>Date of Birth:</span> {' '}
                {new Date(currentRow.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PatientMultiDeleteDialog({
  table,
  open,
  onOpenChange,
}: PatientMultiDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const selectedPatients = Array.isArray(table) ? table : []

  const handleBulkDelete = async () => {
    if (selectedPatients.length === 0) return

    try {
      setIsLoading(true)
      const patientIds = selectedPatients.map(row => row.original.id)

      await apiClient.deletePatients(patientIds)

      toast.success(`Successfully deleted ${selectedPatients.length} patient${selectedPatients.length > 1 ? 's' : ''}`)
      onOpenChange(false)

      // Trigger a refresh by emitting a custom event
      window.dispatchEvent(new CustomEvent('patient:refresh'))
    } catch (error) {
      console.error('Failed to delete patients:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete patients')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Bulk Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedPatients.length} selected patient{selectedPatients.length > 1 ? 's' : ''}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>
            <strong>Selected Patients:</strong>
          </p>
          <div className='mt-2 max-h-40 overflow-y-auto space-y-1 text-sm'>
            {selectedPatients.map((row) => (
              <div key={row.original.id} className='flex justify-between py-1 border-b border-border/50'>
                <span>{row.original.firstName} {row.original.lastName}</span>
                <span className='text-muted-foreground'>{row.original.phone}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleBulkDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : `Delete ${selectedPatients.length} Patient${selectedPatients.length > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}