'use client'

import { PrescriptionsActionDialog } from './prescriptions-action-dialog'
import { PrescriptionsDeleteDialog } from './prescriptions-delete-dialog'
import { usePrescriptions } from './prescriptions-provider'

export function PrescriptionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePrescriptions()

  return (
    <>
      <PrescriptionsActionDialog
        key='prescription-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <PrescriptionsActionDialog
            key={`prescription-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'edit' : null)
              if (!isOpen) {
                setCurrentRow(null)
              }
            }}
            currentRow={currentRow}
          />

          <PrescriptionsDeleteDialog
            key={`prescription-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'delete' : null)
              if (!isOpen) {
                setCurrentRow(null)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
