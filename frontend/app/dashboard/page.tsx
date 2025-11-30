'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentAdmissions } from './components/recent-admissions'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className='w-full space-y-4'>
      <div className='mb-2 flex items-center justify-between space-y-2'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className='text-muted-foreground'>
            Here's what's happening with your hospital today.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button>Download Report</Button>
        </div>
      </div>
      <Tabs orientation='vertical' defaultValue='overview' className='space-y-4'>
        <div className='w-full overflow-x-auto pb-2'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            <TabsTrigger value='reports' disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value='notifications' disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Patients
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                  <circle cx='9' cy='7' r='4' />
                  <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>2,350</div>
                <p className='text-muted-foreground text-xs'>
                  +180 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Appointments Today
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
                  <line x1='16' y1='2' x2='16' y2='6' />
                  <line x1='8' y1='2' x2='8' y2='6' />
                  <line x1='3' y1='10' x2='21' y2='10' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+48</div>
                <p className='text-muted-foreground text-xs'>
                  12 completed, 36 pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Bed Occupancy
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <path d='M2 4v16' />
                  <path d='M2 8h18a2 2 0 0 1 2 2v10' />
                  <path d='M2 17h20' />
                  <path d='M6 8v9' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>86%</div>
                <p className='text-muted-foreground text-xs'>
                  172 of 200 beds occupied
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Staff On Duty
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='text-muted-foreground h-4 w-4'
                >
                  <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>127</div>
                <p className='text-muted-foreground text-xs'>
                  45 doctors, 82 nurses
                </p>
              </CardContent>
            </Card>
          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Monthly Patient Overview</CardTitle>
              </CardHeader>
              <CardContent className='ps-2'>
                <Overview />
              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Recent Admissions</CardTitle>
                <CardDescription>
                  Latest 5 patient admissions today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAdmissions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='analytics' className='space-y-4'>
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
