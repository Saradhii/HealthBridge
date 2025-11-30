'use client'

import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

export function AppTitle() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href='/' className='flex items-center gap-2 px-2 py-1.5 hover:opacity-80 transition-opacity'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
            <LogoIcon className='size-6' />
          </div>
          <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>HealthBridge</span>
            <span className='truncate text-xs'>Hospital Management</span>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
