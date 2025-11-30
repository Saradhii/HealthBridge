'use client'

import { Bell } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export default function NotificationsPage() {
  const features = [
    'Email notification preferences',
    'Push notification settings',
    'Alert types and frequency',
    'Communication channels',
  ]

  return (
    <ComingSoon
      title='Notifications'
      description='Configure how you receive notifications and alerts.'
      icon={Bell}
      features={features}
    />
  )
}
