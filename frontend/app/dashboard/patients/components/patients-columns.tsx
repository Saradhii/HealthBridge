'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes } from '../data/data'
import { type Patient } from '../data/schema'
import { User2, User, Users } from 'lucide-react'

function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  return age
}

export const patientsColumns: ColumnDef<Patient>[] = [
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
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      const fullName = `${firstName} ${lastName}`
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      return (
        <LongText className='max-w-48'>
          {email || '-'}
        </LongText>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      return <div className='text-nowrap'>{row.getValue('phone')}</div>
    },
    enableSorting: false,
  },
  {
    id: 'gender',
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string
      const Icon = gender === 'male' ? User2 : gender === 'female' ? User : Users
      return (
        <div className='flex items-center gap-x-2'>
          <Icon size={14} className='text-muted-foreground' />
          <span className='capitalize'>{gender}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'bloodGroup',
    accessorKey: 'bloodGroup',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Blood Group' />
    ),
    cell: ({ row }) => {
      const bloodGroup = row.getValue('bloodGroup') as string | null
      if (!bloodGroup) return <div className='text-muted-foreground'>-</div>

      const color = bloodGroup.includes('O')
        ? 'text-red-600 dark:text-red-400 border-red-600/20 dark:border-red-400/20'
        : bloodGroup.includes('A')
        ? 'text-blue-600 dark:text-blue-400 border-blue-600/20 dark:border-blue-400/20'
        : bloodGroup.includes('B')
        ? 'text-green-600 dark:text-green-400 border-green-600/20 dark:border-green-400/20'
        : 'text-purple-600 dark:text-purple-400 border-purple-600/20 dark:border-purple-400/20'

      return (
        <Badge variant='outline' className={cn('font-mono', color)}>
          {bloodGroup}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='City' />
    ),
    cell: ({ row }) => {
      const city = row.getValue('city') as string | null
      return <div className='text-nowrap'>{city || '-'}</div>
    },
    enableSorting: false,
  },
  {
    id: 'age',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Age' />
    ),
    cell: ({ row }) => {
      const age = calculateAge(row.original.dateOfBirth)
      return <div>{age} yrs</div>
    },
    enableSorting: false,
  },
  {
    id: 'status',
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
]
