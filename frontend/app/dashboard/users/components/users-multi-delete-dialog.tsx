'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { apiClient } from '@/lib/api'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { refreshUsers } = useUsers()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (isDeleting || selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const userIds = selectedRows.map(row => (row.original as User).id)
      const result = await apiClient.deleteUsers(userIds)

      onOpenChange(false)
      table.resetRowSelection()
      refreshUsers()

      toast.success(result.message)

      // Show partial errors if any
      if (result.errors && result.errors.length > 0) {
        toast.error(`Failed to delete ${result.errors.length} user${result.errors.length > 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Failed to delete users:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete users')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting || selectedRows.length === 0}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'users' : 'user'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the selected {selectedRows.length} {selectedRows.length > 1 ? 'users' : 'user'}? <br />
            This action cannot be undone.
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
