'use client'

import React, { createContext, useContext, useState } from 'react'
import useDialogState from '@/lib/hooks/use-dialog-state'

export type CrudDialogType = 'add' | 'edit' | 'delete' | 'invite'

export type CrudDialogContextValue<TRow> = {
  open: CrudDialogType | null
  setOpen: (value: CrudDialogType | null) => void
  currentRow: TRow | null
  setCurrentRow: React.Dispatch<React.SetStateAction<TRow | null>>
  refresh: () => void
}

/**
 * Creates a typed provider + hook for the standard CRUD-dialog pattern shared by
 * the users, doctors, patients and appointments modules. Each module owns a single
 * "current row" and a refresh callback; the only thing that differs is the row type.
 */
export function createCrudDialogContext<TRow>(name: string) {
  const Context = createContext<CrudDialogContextValue<TRow> | null>(null)

  function Provider({
    children,
    refresh,
  }: {
    children: React.ReactNode
    refresh: () => void
  }) {
    const [open, setOpen] = useDialogState<CrudDialogType>(null)
    const [currentRow, setCurrentRow] = useState<TRow | null>(null)

    return (
      <Context.Provider
        value={{ open, setOpen, currentRow, setCurrentRow, refresh }}
      >
        {children}
      </Context.Provider>
    )
  }

  function useCrudDialog() {
    const context = useContext(Context)
    if (!context) {
      throw new Error(`use${name} has to be used within its provider`)
    }
    return context
  }

  return { Provider, useCrudDialog }
}
