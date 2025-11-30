'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, doctorRole } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const doctorsColumns: ColumnDef<User>[] = [
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3'>{row.getValue('email')}</LongText>
    ),
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
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'specialization',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Specialization' />
    ),
    cell: ({ row }) => {
      const specialization = row.getValue('specialization') as string | null
      return (
        <div className='w-fit ps-2 text-nowrap'>
          {specialization || '-'}
        </div>
      )
    },
    meta: { className: 'w-40' },
    enableSorting: false,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Department' />
    ),
    cell: ({ row }) => {
      const department = row.getValue('department') as string | null
      return (
        <div className='w-fit ps-2 text-nowrap'>
          {department || '-'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'shift',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shift' />
    ),
    cell: ({ row }) => {
      const shift = row.getValue('shift') as string | null
      return (
        <div className='w-fit ps-2 text-nowrap capitalize'>
          {shift || '-'}
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
      const badgeColor = callTypes.get(status)
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
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const userRoles = row.getValue('roles') as Array<{ id: string; name: string; slug: string }>

      return (
        <div className='flex items-center gap-x-1.5'>
          {doctorRole.icon && (
            <doctorRole.icon size={14} className='text-muted-foreground' />
          )}
          <span className='text-xs capitalize'>{doctorRole.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const userRoles = row.getValue(id) as Array<{ id: string; name: string; slug: string }>
      return userRoles.some((role) => value.includes(role.slug))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]