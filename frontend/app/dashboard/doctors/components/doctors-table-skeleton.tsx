'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export function DoctorsTableSkeleton() {
  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      {/* Toolbar Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Skeleton className='h-8 w-[150px] lg:w-[250px]' />
          <div className='flex gap-x-2'>
            <Skeleton className='h-8 w-[100px]' />
            <Skeleton className='h-8 w-[100px]' />
            <Skeleton className='h-8 w-[100px]' />
            <Skeleton className='h-8 w-[100px]' />
          </div>
        </div>
        <Skeleton className='h-8 w-[70px]' />
      </div>

      {/* Table Skeleton */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow className='group/row'>
              <TableHead className='w-[30px]'>
                <Skeleton className='h-4 w-4' />
              </TableHead>
              <TableHead className='ps-0.5 max-md:sticky start-6'>
                <Skeleton className='h-4 w-20' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-16' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-24' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-20' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-16' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-16' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-16' />
              </TableHead>
              <TableHead className='w-[50px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className='group/row'>
                <TableCell>
                  <Skeleton className='h-4 w-4' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-28' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-40' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-6 w-16 rounded-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-8 w-8 rounded-md' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className='flex items-center justify-between overflow-clip px-2'>
        <div className='flex w-full items-center justify-between'>
          <Skeleton className='h-4 w-[100px]' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-[70px]' />
            <Skeleton className='h-4 w-[100px] hidden sm:block' />
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
        </div>
      </div>
    </div>
  )
}