'use client'

import { WardActionDialog } from './ward-action-dialog'
import { RoomActionDialog } from './room-action-dialog'
import { AssignPatientDialog } from './assign-patient-dialog'
import { DeleteDialog } from './delete-dialog'
import { useWards } from './wards-provider'
import { type Ward } from '../data/schema'

type WardsDialogsProps = {
  wards: Ward[]
}

export function WardsDialogs({ wards }: WardsDialogsProps) {
  const { open, setOpen, currentWard, setCurrentWard, currentRoom, setCurrentRoom } = useWards()

  return (
    <>
      {/* Add Ward Dialog */}
      <WardActionDialog
        key='ward-add'
        open={open === 'add-ward'}
        onOpenChange={() => setOpen('add-ward')}
      />

      {/* Edit Ward Dialog */}
      {currentWard && (
        <WardActionDialog
          key={`ward-edit-${currentWard.id}`}
          open={open === 'edit-ward'}
          onOpenChange={() => {
            setOpen('edit-ward')
            setTimeout(() => {
              setCurrentWard(null)
            }, 500)
          }}
          currentWard={currentWard}
        />
      )}

      {/* Delete Ward Dialog */}
      {currentWard && (
        <DeleteDialog
          key={`ward-delete-${currentWard.id}`}
          type='ward'
          item={currentWard}
          open={open === 'delete-ward'}
          onOpenChange={() => {
            setOpen('delete-ward')
            setTimeout(() => {
              setCurrentWard(null)
            }, 500)
          }}
        />
      )}

      {/* Add Room Dialog */}
      <RoomActionDialog
        key='room-add'
        wards={wards}
        defaultWardId={currentWard?.id}
        open={open === 'add-room'}
        onOpenChange={() => {
          setOpen('add-room')
          setTimeout(() => {
            setCurrentWard(null)
          }, 500)
        }}
      />

      {/* Edit Room Dialog */}
      {currentRoom && (
        <RoomActionDialog
          key={`room-edit-${currentRoom.id}`}
          wards={wards}
          currentRoom={currentRoom}
          open={open === 'edit-room'}
          onOpenChange={() => {
            setOpen('edit-room')
            setTimeout(() => {
              setCurrentRoom(null)
            }, 500)
          }}
        />
      )}

      {/* Delete Room Dialog */}
      {currentRoom && (
        <DeleteDialog
          key={`room-delete-${currentRoom.id}`}
          type='room'
          item={currentRoom}
          open={open === 'delete-room'}
          onOpenChange={() => {
            setOpen('delete-room')
            setTimeout(() => {
              setCurrentRoom(null)
            }, 500)
          }}
        />
      )}

      {/* Assign Patient Dialog */}
      {currentRoom && (
        <AssignPatientDialog
          key={`assign-patient-${currentRoom.id}`}
          room={currentRoom}
          open={open === 'assign-patient'}
          onOpenChange={() => {
            setOpen('assign-patient')
            setTimeout(() => {
              setCurrentRoom(null)
            }, 500)
          }}
        />
      )}
    </>
  )
}
