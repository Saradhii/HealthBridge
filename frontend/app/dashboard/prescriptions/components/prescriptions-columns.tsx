'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type Prescription } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { Calendar, Pill } from 'lucide-react'

export const prescriptionsColumns: ColumnDef<Prescription>[] = [
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
    accessorKey: 'diagnosis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Diagnosis' />
    ),
    cell: ({ row }) => {
      const diagnosis = row.getValue('diagnosis') as string | null
      return (
        <LongText className='max-w-48 text-sm'>{diagnosis || '-'}</LongText>
      )
    },
    enableSorting: false,
  },
  {
    id: 'medications',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Medications' />
    ),
    cell: ({ row }) => {
      const { items } = row.original
      const count = items?.length ?? 0
      const first = items?.[0]?.name
      return (
        <div className='flex items-center gap-1.5 text-sm'>
          <Pill size={14} className='text-muted-foreground' />
          <span>
            {count === 0
              ? '-'
              : count === 1
                ? first
                : `${first} +${count - 1} more`}
          </span>
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
            {status}
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
    id: 'doctorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Prescribed By' />
    ),
    cell: ({ row }) => {
      const { doctor } = row.original
      return <div className='text-sm'>{doctor?.name || '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'issuedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Issued' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('issuedDate') as Date
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
    id: 'actions',
    cell: DataTableRowActions,
  },
]
