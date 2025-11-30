'use client'

import { ClipboardList } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function LabResultsPage() {
  const features = [
    'View and manage laboratory test results',
    'Digital lab report uploads',
    'Trend analysis for lab values',
    'Critical value alerts',
    'Integration with lab systems',
    'Patient result notifications',
  ]

  return (
    <ComingSoon
      title='Lab Results'
      description='Access and manage patient laboratory test results and reports.'
      icon={ClipboardList}
      features={features}
    />
  )
}