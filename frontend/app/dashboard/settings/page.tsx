'use client'

import { useEffect, useState } from 'react'
import { ContentSection } from './components/content-section'
import { ProfileForm } from './components/profile-form'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsProfilePage() {
  const { user: authUser } = useAuthStore()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getCurrentUser()
        setUser(response.user)
      } catch (err) {
        console.error('Failed to fetch current user:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
        // Fallback to auth store user if API call fails
        if (authUser) {
          setUser(authUser)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [authUser])

  if (isLoading) {
    return (
      <ContentSection
        title='Profile'
        desc='Manage your personal information and preferences.'
      >
        <div className='space-y-8'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-4 w-64' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-4 w-64' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-4 w-64' />
          </div>
        </div>
      </ContentSection>
    )
  }

  if (error && !user) {
    return (
      <ContentSection
        title='Profile'
        desc='Manage your personal information and preferences.'
      >
        <div className='flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-8'>
          <p className='text-destructive'>{error}</p>
        </div>
      </ContentSection>
    )
  }

  if (!user) {
    return (
      <ContentSection
        title='Profile'
        desc='Manage your personal information and preferences.'
      >
        <div className='flex items-center justify-center rounded-md border p-8'>
          <p className='text-muted-foreground'>No user data available</p>
        </div>
      </ContentSection>
    )
  }

  return (
    <ContentSection
      title='Profile'
      desc='Manage your personal information and preferences.'
    >
      <ProfileForm user={user} />
    </ContentSection>
  )
}
