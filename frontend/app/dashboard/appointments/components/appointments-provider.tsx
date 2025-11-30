'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { type Appointment } from '../data/schema'

type DialogType = 'add' | 'edit' | 'delete' | 'invite' | null

interface AppointmentsContextType {
  open: DialogType
  setOpen: (open: DialogType) => void
  currentRow: Appointment | null
  setCurrentRow: (row: Appointment | null) => void
  refreshAppointments: () => void
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined
)

interface AppointmentsProviderProps {
  children: ReactNode
  refreshAppointments: () => void
}

export function AppointmentsProvider({
  children,
  refreshAppointments,
}: AppointmentsProviderProps) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<Appointment | null>(null)

  const value = {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    refreshAppointments,
  }

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const context = useContext(AppointmentsContext)
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider')
  }
  return context
}
