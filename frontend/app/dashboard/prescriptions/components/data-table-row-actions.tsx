'use client'

import { type Row } from '@tanstack/react-table'
import { DataTableRowActions as RowActions } from '@/components/data-table'
import { type Prescription } from '../data/schema'
import { usePrescriptions } from './prescriptions-provider'

type DataTableRowActionsProps = {
  row: Row<Prescription>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePrescriptions()
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
