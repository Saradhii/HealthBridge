'use client'

import { LucideIcon } from 'lucide-react'
import { CenteredPageLayout } from '@/components/layout/centered-page-layout'

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
  features?: string[]
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <CenteredPageLayout title={title}>
      <div className='text-center'>
        <div className='rounded-full bg-muted p-6 mb-6 mx-auto w-fit'>
          <Icon className='h-12 w-12 text-muted-foreground' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>
          Coming Soon
        </h3>
        <p className='text-muted-foreground max-w-md mx-auto'>
          {description}
        </p>
      </div>
    </CenteredPageLayout>
  )
}