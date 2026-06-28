'use client'

import { LabResultsActionDialog } from './lab-results-action-dialog'
import { LabResultsDeleteDialog } from './lab-results-delete-dialog'
import { useLabResults } from './lab-results-provider'

export function LabResultsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useLabResults()

  return (
    <>
      <LabResultsActionDialog
        key='lab-result-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <LabResultsActionDialog
            key={`lab-result-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'edit' : null)
              if (!isOpen) {
                setCurrentRow(null)
              }
            }}
            currentRow={currentRow}
          />

          <LabResultsDeleteDialog
            key={`lab-result-delete-${currentRow.id}`}
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
