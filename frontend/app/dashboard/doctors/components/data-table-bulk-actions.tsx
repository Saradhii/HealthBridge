'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../data/schema'
import { DoctorsMultiDeleteDialog } from './doctors-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedDoctors = selectedRows.map((row) => row.original as User)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `${status === 'active' ? 'Activating' : 'Deactivating'} doctors...`,
        success: () => {
          table.resetRowSelection()
          return `${status === 'active' ? 'Activated' : 'Deactivated'} ${selectedDoctors.length} doctor${selectedDoctors.length > 1 ? 's' : ''}`
        },
        error: `Error ${status === 'active' ? 'activating' : 'deactivating'} doctors`,
      }
    )
    table.resetRowSelection()
  }

  const handleBulkInvite = () => {
    const selectedDoctors = selectedRows.map((row) => row.original as User)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Inviting doctors...',
        success: () => {
          table.resetRowSelection()
          return `Invited ${selectedDoctors.length} doctor${selectedDoctors.length > 1 ? 's' : ''}`
        },
        error: 'Error inviting doctors',
      }
    )
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='doctor'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkInvite}
              className='size-8'
              aria-label='Invite selected doctors'
              title='Invite selected doctors'
            >
              <Mail />
              <span className='sr-only'>Invite selected doctors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Invite selected doctors</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='Activate selected doctors'
              title='Activate selected doctors'
            >
              <UserCheck />
              <span className='sr-only'>Activate selected doctors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected doctors</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='Deactivate selected doctors'
              title='Deactivate selected doctors'
            >
              <UserX />
              <span className='sr-only'>Deactivate selected doctors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected doctors</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected doctors'
              title='Delete selected doctors'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected doctors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected doctors</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <DoctorsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}