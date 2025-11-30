'use client'

import { useLayout } from '@/lib/layout-provider'
import { useAuthStore } from '@/lib/store/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
// import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.user)

  // Create user object from auth store, with fallback to static data
  const userData = {
    name: user?.name || sidebarData.user.name,
    email: user?.email || sidebarData.user.email,
    avatar: sidebarData.user.avatar, // Keep default avatar since we don't have user avatars
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />

        {/* Replace <AppTitle /> with the following <TeamSwitch />
         /* if you want to use the team switcher dropdown instead of app title */}
        {/* <TeamSwitcher teams={sidebarData.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
