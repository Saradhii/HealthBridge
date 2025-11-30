'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuthStore } from '@/lib/store/auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const tenant = useAuthStore((state) => state.tenant)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/signin')
  }

  return (
    <>
      <header
        className={cn(
          'z-50 h-16',
          fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
          offset > 10 && fixed ? 'shadow' : 'shadow-none',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'relative flex h-full items-center gap-3 p-4 sm:gap-4',
            offset > 10 &&
              fixed &&
              'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
          )}
        >
          <SidebarTrigger variant='outline' className='max-md:scale-125' />
          <Separator orientation='vertical' className='h-6' />
          {children}

          {/* Right side actions */}
          <div className='ml-auto flex items-center gap-2'>
            <ThemeToggle />
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowLogoutDialog(true)}
              title='Logout'
            >
              <LogOut className='h-5 w-5' />
              <span className='sr-only'>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
