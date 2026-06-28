'use client'

import { type Row } from '@tanstack/react-table'
import { DataTableRowActions as RowActions } from '@/components/data-table'
import { type Procedure } from '../data/schema'
import { useProcedures } from './procedures-provider'

type DataTableRowActionsProps = {
  row: Row<Procedure>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useProcedures()
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
