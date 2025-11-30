'use client'

import { Pill } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function PrescriptionsPage() {
  return (
    <ComingSoon
      title='Prescriptions'
      description='Manage patient medications and prescriptions with comprehensive tracking.'
      icon={Pill}
    />
  )
}