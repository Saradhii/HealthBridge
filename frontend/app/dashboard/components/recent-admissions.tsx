'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function RecentAdmissions() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/01.png' alt='Avatar' />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>John Doe</p>
            <p className='text-muted-foreground text-sm'>
              Emergency - Cardiology
            </p>
          </div>
          <div className='text-muted-foreground text-sm'>2h ago</div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border'>
          <AvatarImage src='/avatars/02.png' alt='Avatar' />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Sarah Miller</p>
            <p className='text-muted-foreground text-sm'>
              ICU - Neurology
            </p>
          </div>
          <div className='text-muted-foreground text-sm'>3h ago</div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/03.png' alt='Avatar' />
          <AvatarFallback>RJ</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Robert Johnson</p>
            <p className='text-muted-foreground text-sm'>
              General Ward - Orthopedics
            </p>
          </div>
          <div className='text-muted-foreground text-sm'>5h ago</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/04.png' alt='Avatar' />
          <AvatarFallback>EW</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Emily Wilson</p>
            <p className='text-muted-foreground text-sm'>
              Maternity - Obstetrics
            </p>
          </div>
          <div className='text-muted-foreground text-sm'>6h ago</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/05.png' alt='Avatar' />
          <AvatarFallback>MB</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Michael Brown</p>
            <p className='text-muted-foreground text-sm'>
              Pediatrics - General
            </p>
          </div>
          <div className='text-muted-foreground text-sm'>8h ago</div>
        </div>
      </div>
    </div>
  )
}
