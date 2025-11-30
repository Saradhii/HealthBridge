'use client'

import { Syringe } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function ProceduresPage() {
  const features = [
    'Schedule and track medical procedures',
    'Pre-procedure checklists',
    'Post-procedure care instructions',
    'Procedure documentation',
    'Resource management',
    'Consent form management',
  ]

  return (
    <ComingSoon
      title='Procedures'
      description='Manage medical procedures, scheduling, and patient care workflows.'
      icon={Syringe}
      features={features}
    />
  )
}