'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Role } from '@/lib/types'

function RoleActions({ role }: { role: Role }) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/dashboard/users/roles/${role.id}`)}>
          <Eye className='mr-2 h-4 w-4' />
          View Details
        </DropdownMenuItem>
        {!role.isSystemRole && (
          <>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/users/roles/${role.id}/edit`)}>
              <Pencil className='mr-2 h-4 w-4' />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive'>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Role
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const rolesColumns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 font-medium'>{row.getValue('name')}</LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-2 py-1 text-xs'>{row.getValue('slug')}</code>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      return (
        <LongText className='max-w-64 text-muted-foreground'>
          {description || 'No description'}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'hierarchyLevel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Level' />
    ),
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('hierarchyLevel')}</div>
    ),
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Users' />
    ),
    cell: ({ row }) => {
      const count = row.getValue('userCount') as number
      return <div className='text-center'>{count || 0}</div>
    },
  },
  {
    accessorKey: 'isSystemRole',
    header: 'Type',
    cell: ({ row }) => {
      const isSystem = row.getValue('isSystemRole') as boolean
      return (
        <Badge variant={isSystem ? 'default' : 'outline'} className='capitalize'>
          {isSystem ? 'System' : 'Custom'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <RoleActions role={row.original} />,
  },
]
