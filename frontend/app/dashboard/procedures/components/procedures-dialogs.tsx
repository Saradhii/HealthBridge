'use client'

import { ProceduresActionDialog } from './procedures-action-dialog'
import { ProceduresDeleteDialog } from './procedures-delete-dialog'
import { useProcedures } from './procedures-provider'

export function ProceduresDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProcedures()

  return (
    <>
      <ProceduresActionDialog
        key='procedure-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <ProceduresActionDialog
            key={`procedure-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'edit' : null)
              if (!isOpen) {
                setCurrentRow(null)
              }
            }}
            currentRow={currentRow}
          />

          <ProceduresDeleteDialog
            key={`procedure-delete-${currentRow.id}`}
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
