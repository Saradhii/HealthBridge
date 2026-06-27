'use client'

import { LucideIcon } from 'lucide-react'
import { CenteredPageLayout } from '@/components/layout/centered-page-layout'

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
  features?: string[]
}

export function ComingSoon({
  title,
  description,
  icon: Icon,
  features,
}: ComingSoonProps) {
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
        {features && features.length > 0 && (
          <div className='mt-6 mx-auto w-fit text-left'>
            <p className='text-sm font-medium mb-2'>Planned</p>
            <ul className='list-disc ps-5 space-y-1 text-sm text-muted-foreground'>
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CenteredPageLayout>
  )
}