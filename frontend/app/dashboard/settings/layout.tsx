import { UserCog, Bell, Palette } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/dashboard/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Appearance',
    href: '/dashboard/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: '/dashboard/settings/notifications',
    icon: <Bell size={18} />,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
          Settings
        </h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator className='my-4 lg:my-6' />
      <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <aside className='top-0 lg:sticky lg:w-1/5'>
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className='flex w-full overflow-y-hidden p-1'>
          {children}
        </div>
      </div>
    </div>
  )
}
