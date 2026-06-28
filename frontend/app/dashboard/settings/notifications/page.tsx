'use client'

import { ContentSection } from '../components/content-section'
import { NotificationsForm } from '../components/notifications-form'

export default function NotificationsPage() {
  return (
    <ContentSection
      title='Notifications'
      desc='Configure how you receive notifications and alerts.'
    >
      <NotificationsForm />
    </ContentSection>
  )
}
