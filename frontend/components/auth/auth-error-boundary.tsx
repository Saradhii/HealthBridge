'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { toast } from 'sonner'

// Hook for handling API errors outside of React components
export const useAuthErrorHandler = () => {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleAuthError = (error: Error) => {
    if (error.message.includes('Invalid or expired token') ||
        error.message.includes('No access token found') ||
        error.message.includes('No refresh token available')) {

      clearAuth()
      toast.error('Your session has expired. Please log in again.')
      router.push('/signin')
    }
  }

  return { handleAuthError }
}