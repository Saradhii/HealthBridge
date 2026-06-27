'use client'

import { PatientActionDialog } from './patient-action-dialog'
import { PatientDeleteDialog } from './patient-delete-dialog'
import { usePatients } from './patients-provider'

export function PatientsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePatients()
  return (
    <>
      <PatientActionDialog
        key='patient-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <PatientActionDialog
            key={`patient-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <PatientDeleteDialog
            key={`patient-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
