'use client'

import { Link } from 'next/navigation'
import { FileX, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContentSection } from './settings/components/content-section'

export default function DashboardNotFound() {
  return (
    <ContentSection
      title='Page Not Found'
      desc='The page you are looking for does not exist or has been moved.'
    >
      <div className='flex flex-col items-center justify-center py-12'>
        <div className='rounded-full bg-muted p-6 mb-6'>
          <FileX className='h-12 w-12 text-muted-foreground' />
        </div>
        <h3 className='text-2xl font-semibold mb-2'>404 - Page Not Found</h3>
        <p className='text-muted-foreground text-center max-w-md mb-8'>
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been removed,
          renamed, or might be temporarily unavailable.
        </p>

        <div className='flex flex-col sm:flex-row gap-3'>
          <Button asChild variant='default'>
            <Link href='/dashboard' className='flex items-center gap-2'>
              <Home className='h-4 w-4' />
              Go to Dashboard
            </Link>
          </Button>

          <Button asChild variant='outline'>
            <button onClick={() => window.history.back()} className='flex items-center gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Go Back
            </button>
          </Button>
        </div>

        <div className='mt-8 text-sm text-muted-foreground'>
          <p className='mb-2'>You might be looking for:</p>
          <div className='flex flex-wrap justify-center gap-2'>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/dashboard/patients'>Patients</Link>
            </Button>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/dashboard/appointments'>Appointments</Link>
            </Button>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/dashboard/doctors'>Doctors</Link>
            </Button>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/dashboard/wards'>Wards & Beds</Link>
            </Button>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/dashboard/settings'>Settings</Link>
            </Button>
          </div>
        </div>
      </div>
    </ContentSection>
  )
}