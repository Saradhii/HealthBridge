'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type Procedure } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'

export const proceduresColumns: ColumnDef<Procedure>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'patientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient' />
    ),
    cell: ({ row }) => {
      const { patient } = row.original
      const fullName = `${patient.firstName} ${patient.lastName}`
      return <LongText className='max-w-48 ps-3'>{fullName}</LongText>
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Procedure' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const { category } = row.original
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-medium'>{name}</span>
          {category && (
            <span className='text-xs text-muted-foreground'>{category}</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = statusColors.get(status)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'performedByName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Performed By' />
    ),
    cell: ({ row }) => {
      const { performedBy } = row.original
      return <div className='text-sm'>{performedBy?.name || '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'scheduledDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Scheduled' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('scheduledDate') as Date
      return (
        <div className='flex items-center gap-1.5 text-sm'>
          <Calendar size={14} className='text-muted-foreground' />
          <span>{format(date, 'MMM dd, yyyy')}</span>
        </div>
      )
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'outcome',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Outcome' />
    ),
    cell: ({ row }) => {
      const outcome = row.getValue('outcome') as string | null
      return (
        <LongText className='max-w-48 text-sm text-muted-foreground'>
          {outcome || '-'}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
