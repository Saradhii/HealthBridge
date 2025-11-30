'use client'

import { Pill } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function PrescriptionsPage() {
  const features = [
    'Create and manage patient prescriptions',
    'Medication database with dosage information',
    'Drug interaction checking',
    'Prescription history tracking',
    'E-prescription capabilities',
    'Pharmacy integration',
  ]

  return (
    <ComingSoon
      title='Prescriptions'
      description='Manage patient medications and prescriptions with comprehensive tracking.'
      icon={Pill}
      features={features}
    />
  )
}