'use client'

import { type ColumnDef } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    thClassName?: string
    tdClassName?: string
  }
}
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type Appointment } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

export const appointmentsColumns: ColumnDef<Appointment>[] = [
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
    accessorKey: 'appointmentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date & Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('appointmentDate') as Date
      return (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-1.5 text-sm'>
            <Calendar size={14} className='text-muted-foreground' />
            <span>{format(date, 'MMM dd, yyyy')}</span>
          </div>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <Clock size={12} />
            <span>{format(date, 'hh:mm a')}</span>
          </div>
        </div>
      )
    },
    meta: { className: 'w-40' },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant='outline' className='capitalize'>
          {type.replace('-', ' ')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
    id: 'contact',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact' />
    ),
    cell: ({ row }) => {
      const { patient } = row.original
      return (
        <div className='flex flex-col gap-0.5 text-sm'>
          {patient.phone && <div>{patient.phone}</div>}
          {patient.email && (
            <div className='text-xs text-muted-foreground'>{patient.email}</div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | null
      return (
        <LongText className='max-w-64 text-sm text-muted-foreground'>
          {notes || '-'}
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
