'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type Direction = 'ltr' | 'rtl'

interface DirectionProviderProps {
  children: ReactNode
  direction?: Direction
}

const DirectionContext = createContext<Direction | undefined>(undefined)

export function DirectionProvider({
  children,
  direction = 'ltr'
}: DirectionProviderProps) {
  return (
    <DirectionContext.Provider value={direction}>
      <div dir={direction}>
        {children}
      </div>
    </DirectionContext.Provider>
  )
}

export function useDirection() {
  const context = useContext(DirectionContext)
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider')
  }
  return context
}