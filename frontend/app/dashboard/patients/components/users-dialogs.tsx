'use client'

import { PatientActionDialog } from './patient-action-dialog'
import { PatientDeleteDialog } from './patient-delete-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <PatientActionDialog
        key='patient-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {/* Note: 'invite' functionality can be repurposed for quick patient admission if needed */}

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
