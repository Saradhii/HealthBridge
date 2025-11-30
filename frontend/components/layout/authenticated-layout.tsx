'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/lib/layout-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { useAuthStore } from '@/lib/store/auth'
import { useAuthErrorHandler } from '@/components/auth/auth-error-boundary'
import { useTokenRefresh } from '@/lib/hooks/useTokenRefresh'
import { apiClient } from '@/lib/api'

type AuthenticatedLayoutProps = {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, accessToken, user, _hasHydrated } = useAuthStore()
  const { handleAuthError } = useAuthErrorHandler()
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  // Automatically refresh tokens before they expire
  useTokenRefresh()

  useEffect(() => {
    // Wait for hydration to complete before checking auth
    if (!_hasHydrated) {
      return
    }

    // After hydration, check if user is authenticated
    if (!isAuthenticated || !accessToken || !user) {
      router.push('/signin')
      return
    }

    // Proactive token validation
    const validateToken = async () => {
      try {
        // Make a lightweight request to validate the token
        await apiClient.getPermissions()
      } catch (error) {
        if (error instanceof Error) {
          handleAuthError(error)
        }
      }
    }

    // Validate token on mount
    validateToken()

    // Set up periodic validation (every 5 minutes)
    const interval = setInterval(validateToken, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [_hasHydrated, isAuthenticated, accessToken, user, router, handleAuthError])

  // Show loading state while hydrating from localStorage
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we restore your session.</p>
        </div>
      </div>
    )
  }

  // After hydration, show loading if not authenticated (will redirect)
  if (!isAuthenticated || !accessToken || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Authenticating...</h2>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <LayoutProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset
          className={cn(
            // Set content container, so we can use container queries
            '@container/content',

            // If layout is fixed, set the height
            // to 100svh to prevent overflow
            'has-data-[layout=fixed]:h-svh',

            // If layout is fixed and sidebar is inset,
            // set the height to 100svh - spacing (total margins) to prevent overflow
            'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
          )}
        >
          {children}
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}
