'use client'

import { ClipboardList } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function LabResultsPage() {
  return (
    <ComingSoon
      title='Lab Results'
      description='Access and manage patient laboratory test results and reports.'
      icon={ClipboardList}
    />
  )
}