'use client'

import { ReactNode } from 'react'

interface CenteredPageLayoutProps {
  children: ReactNode
  title?: string
}

export function CenteredPageLayout({ children, title }: CenteredPageLayoutProps) {
  return (
    <div className='flex flex-1 flex-col'>
      {title && (
        <div className='flex-none px-6 py-4'>
          <h1 className='text-2xl font-semibold'>{title}</h1>
        </div>
      )}
      <div className='flex-1 flex items-center justify-center p-6'>
        <div className='w-full max-w-md'>
          {children}
        </div>
      </div>
    </div>
  )
}