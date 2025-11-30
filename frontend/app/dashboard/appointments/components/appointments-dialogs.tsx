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
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AppointmentsActionDialog
            key={`appointment-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AppointmentsDeleteDialog
            key={`appointment-delete-${currentRow.id}`}
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
