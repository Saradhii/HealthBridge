import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export function WardsSkeleton() {
  return (
    <div className='grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className='flex items-start gap-3'>
              <Skeleton className='h-10 w-10 rounded-lg' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-24' />
              </div>
              <Skeleton className='h-2 w-full' />
              <Skeleton className='h-3 w-16 ml-auto' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-20 w-full rounded-lg' />
            </div>
          </CardContent>
          <CardFooter className='border-t pt-6'>
            <Skeleton className='h-9 w-full' />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
