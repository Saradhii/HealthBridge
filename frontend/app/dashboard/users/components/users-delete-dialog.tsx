'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { apiClient } from '@/lib/api'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { refreshUsers } = useUsers()

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await apiClient.deleteUser(currentRow.id)
      onOpenChange(false)
      refreshUsers()
      toast.success(`User "${currentRow.name}" has been deleted successfully`)
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const userRoles = currentRow.roles.map(r => r.name).join(', ')

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
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span> ({currentRow.email})?
            <br />
            This action will permanently remove the user with role(s) of{' '}
            <span className='font-bold'>
              {userRoles}
            </span>{' '}
            from the system. This cannot be undone.
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
