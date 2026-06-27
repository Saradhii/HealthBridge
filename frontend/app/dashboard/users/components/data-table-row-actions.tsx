'use client'

import { type Row } from '@tanstack/react-table'
import { DataTableRowActions as RowActions } from '@/components/data-table'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  return (
    <RowActions
      onEdit={() => {
        setCurrentRow(row.original)
        setOpen('edit')
      }}
      onDelete={() => {
        setCurrentRow(row.original)
        setOpen('delete')
      }}
    />
  )
}
