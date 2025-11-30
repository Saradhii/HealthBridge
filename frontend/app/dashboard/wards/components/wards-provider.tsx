'use client'

import React, { useState } from 'react'
import useDialogState from '@/lib/hooks/use-dialog-state'
import { type Ward, type Room } from '../data/schema'

type WardsDialogType = 'add-ward' | 'edit-ward' | 'delete-ward' | 'add-room' | 'edit-room' | 'delete-room' | 'assign-patient'

type WardsContextType = {
  open: WardsDialogType | null
  setOpen: (str: WardsDialogType | null) => void
  currentWard: Ward | null
  setCurrentWard: React.Dispatch<React.SetStateAction<Ward | null>>
  currentRoom: Room | null
  setCurrentRoom: React.Dispatch<React.SetStateAction<Room | null>>
  refreshWards: () => void
}

const WardsContext = React.createContext<WardsContextType | null>(null)

export function WardsProvider({
  children,
  refreshWards,
}: {
  children: React.ReactNode
  refreshWards: () => void
}) {
  const [open, setOpen] = useDialogState<WardsDialogType>(null)
  const [currentWard, setCurrentWard] = useState<Ward | null>(null)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)

  return (
    <WardsContext.Provider
      value={{
        open,
        setOpen,
        currentWard,
        setCurrentWard,
        currentRoom,
        setCurrentRoom,
        refreshWards,
      }}
    >
      {children}
    </WardsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWards = () => {
  const wardsContext = React.useContext(WardsContext)

  if (!wardsContext) {
    throw new Error('useWards has to be used within <WardsProvider>')
  }

  return wardsContext
}
