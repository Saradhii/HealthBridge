import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Building2,
  Settings,
  UserCog,
  Bell,
  Palette,
  HelpCircle,
  Activity,
  Pill,
  ClipboardList,
  BedDouble,
  Syringe,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@healthbridge.com',
    avatar: '/avatars/user.jpg',
  },
  teams: [
    {
      name: 'HealthBridge',
      logo: Activity,
      plan: 'Hospital Management',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Patients',
          url: '/dashboard/patients',
          icon: Users,
        },
        {
          title: 'User Management',
          url: '/dashboard/users',
          icon: UsersRound,
        },
        {
          title: 'Appointments',
          url: '/dashboard/appointments',
          icon: Calendar,
        },
      ],
    },
    {
      title: 'Clinical',
      items: [
        {
          title: 'Doctors',
          url: '/dashboard/doctors',
          icon: Stethoscope,
        },
        {
          title: 'Wards & Beds',
          url: '/dashboard/wards',
          icon: BedDouble,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/dashboard/settings',
              icon: UserCog,
            },
            {
              title: 'Appearance',
              url: '/dashboard/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/dashboard/settings/notifications',
              icon: Bell,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/dashboard/help',
          icon: HelpCircle,
        },
      ],
    },
    {
      title: 'Under Development',
      items: [
        {
          title: 'Prescriptions',
          url: '/dashboard/prescriptions',
          icon: Pill,
        },
        {
          title: 'Lab Results',
          url: '/dashboard/lab-results',
          icon: ClipboardList,
        },
        {
          title: 'Procedures',
          url: '/dashboard/procedures',
          icon: Syringe,
        },
      ],
    },
  ],
}
