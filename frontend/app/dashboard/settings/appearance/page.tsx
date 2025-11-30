'use client'

import { Palette } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function AppearancePage() {
  const features = [
    'Theme customization (Light/Dark mode)',
    'Color scheme preferences',
    'Font and display settings',
  ]

  return (
    <ComingSoon
      title='Appearance'
      description='Customize the appearance of your dashboard.'
      icon={Palette}
      features={features}
    />
  )
}
