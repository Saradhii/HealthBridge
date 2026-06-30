'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DataLoadErrorProps = {
  /** Friendly headline. Defaults to a generic, reassuring message. */
  title?: string
  /** Supporting line under the headline. */
  description?: string
  /** When provided, renders a "Try again" button that re-runs the fetch. */
  onRetry?: () => void
}

/**
 * Subtle, non-alarming placeholder shown when a section fails to load.
 * Intentionally avoids destructive/red styling and raw error text so a
 * transient hiccup reads as "try again" rather than "something is broken".
 */
export function DataLoadError({
  title = 'Couldn’t load this just now',
  description = 'There was a temporary problem loading this information. Please try again in a moment.',
  onRetry,
}: DataLoadErrorProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-10 text-center'>
      <div className='flex size-10 items-center justify-center rounded-full bg-muted'>
        <RefreshCw className='size-5 text-muted-foreground' />
      </div>
      <div className='space-y-1'>
        <p className='text-sm font-medium text-foreground'>{title}</p>
        <p className='max-w-sm text-sm text-muted-foreground'>{description}</p>
      </div>
      {onRetry && (
        <Button variant='outline' size='sm' onClick={onRetry} className='mt-1'>
          <RefreshCw className='size-4' />
          Try again
        </Button>
      )}
    </div>
  )
}
