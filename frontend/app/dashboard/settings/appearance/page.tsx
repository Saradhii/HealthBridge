'use client'

import { ContentSection } from '../components/content-section'
import { AppearanceForm } from '../components/appearance-form'

export default function AppearancePage() {
  return (
    <ContentSection
      title='Appearance'
      desc='Customize the appearance of your dashboard. Switch between light and dark themes.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
