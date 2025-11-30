'use client'

import { LucideIcon } from 'lucide-react'
import { ContentSection } from '@/app/dashboard/settings/components/content-section'

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
  features: string[]
}

export function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  return (
    <ContentSection title={title} desc={description}>
      <div className='flex flex-col items-center justify-center py-12'>
        <div className='rounded-full bg-muted p-6 mb-6'>
          <Icon className='h-12 w-12 text-muted-foreground' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>
          {title} Coming Soon
        </h3>
        <p className='text-muted-foreground text-center max-w-md mb-6'>
          This feature is currently under development. We're working hard to bring you the best experience.
        </p>
        <div className='text-sm text-muted-foreground'>
          <ul className='space-y-2'>
            {features.map((feature, index) => (
              <li key={index} className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-muted-foreground' />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ContentSection>
  )
}