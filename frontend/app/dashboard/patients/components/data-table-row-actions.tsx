'use client'

import { type Row } from '@tanstack/react-table'
import { DataTableRowActions as RowActions } from '@/components/data-table'
import { type Patient } from '../data/schema'
import { usePatients } from './patients-provider'

type DataTableRowActionsProps = {
  row: Row<Patient>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePatients()
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
