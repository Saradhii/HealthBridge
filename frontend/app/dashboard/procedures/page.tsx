'use client'

import { Syringe } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function ProceduresPage() {
  return (
    <ComingSoon
      title='Procedures'
      description='Manage medical procedures, scheduling, and patient care workflows.'
      icon={Syringe}
    />
  )
}