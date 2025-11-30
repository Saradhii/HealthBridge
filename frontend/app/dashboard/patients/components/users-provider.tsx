'use client'

import React, { useState } from 'react'
import useDialogState from '@/lib/hooks/use-dialog-state'
import { type Patient } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: Patient | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Patient | null>>
  refreshUsers: () => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({
  children,
  refreshUsers
}: {
  children: React.ReactNode
  refreshUsers: () => void
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Patient | null>(null)

  return (
    <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, refreshUsers }}>
      {children}
    </UsersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}

// Also export as usePatients for clarity in components
export const usePatients = useUsers
