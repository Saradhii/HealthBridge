'use client'

import { AppointmentsActionDialog } from './appointments-action-dialog'
import { AppointmentsDeleteDialog } from './appointments-delete-dialog'
import { useAppointments } from './appointments-provider'

export function AppointmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAppointments()

  return (
    <>
      <AppointmentsActionDialog
        key='appointment-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <AppointmentsActionDialog
            key={`appointment-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'edit' : null)
              if (!isOpen) {
                setCurrentRow(null)
              }
            }}
            currentRow={currentRow}
          />

          <AppointmentsDeleteDialog
            key={`appointment-delete-${currentRow.id}`}
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
