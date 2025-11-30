'use client'

import { useAuthStore } from '@/lib/store/auth'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = useAuthStore((state) => state.tenant)

  return (
    <AuthenticatedLayout>
      <Header fixed>
        <h1 className='text-lg font-semibold'>{tenant?.name || 'HealthBridge'}</h1>
      </Header>
      <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
    </AuthenticatedLayout>
  )
}
