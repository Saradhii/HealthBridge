'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Patient } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedPatients = selectedRows.map((row) => row.original as Patient)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `${status === 'active' ? 'Activating' : 'Deactivating'} patients...`,
        success: () => {
          table.resetRowSelection()
          return `${status === 'active' ? 'Activated' : 'Deactivated'} ${selectedPatients.length} patient${selectedPatients.length > 1 ? 's' : ''}`
        },
        error: `Error ${status === 'active' ? 'activating' : 'deactivating'} patients`,
      }
    )
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='patient'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='Activate selected patients'
              title='Activate selected patients'
            >
              <UserCheck />
              <span className='sr-only'>Activate selected patients</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected patients</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='Deactivate selected patients'
              title='Deactivate selected patients'
            >
              <UserX />
              <span className='sr-only'>Deactivate selected patients</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected patients</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected patients'
              title='Delete selected patients'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected patients</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected patients</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {/* TODO: Create patient-specific multi-delete dialog */}
    </>
  )
}
