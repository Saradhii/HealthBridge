'use client'

import React, { useState } from 'react'
import useDialogState from '@/lib/hooks/use-dialog-state'
import { type User } from '../data/schema'

type DoctorsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type DoctorsContextType = {
  open: DoctorsDialogType | null
  setOpen: (str: DoctorsDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  refreshDoctors: () => void
}

const DoctorsContext = React.createContext<DoctorsContextType | null>(null)

export function DoctorsProvider({
  children,
  refreshDoctors
}: {
  children: React.ReactNode
  refreshDoctors: () => void
}) {
  const [open, setOpen] = useDialogState<DoctorsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return (
    <DoctorsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, refreshDoctors }}>
      {children}
    </DoctorsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDoctors = () => {
  const doctorsContext = React.useContext(DoctorsContext)

  if (!doctorsContext) {
    throw new Error('useDoctors has to be used within <DoctorsContext>')
  }

  return doctorsContext
}