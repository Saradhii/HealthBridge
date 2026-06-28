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

type DataTableSkeletonProps = {
  /** Number of data columns between the select and actions columns. */
  columns?: number
  /** Number of placeholder rows to render. */
  rows?: number
  /** Whether to render a trailing actions column placeholder. */
  showActions?: boolean
}

/**
 * Generic loading placeholder shared by the users, doctors and patients tables.
 */
export function DataTableSkeleton({
  columns = 6,
  rows = 10,
  showActions = true,
}: DataTableSkeletonProps) {
  const dataColumns = Array.from({ length: columns })

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      {/* Toolbar Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Skeleton className='h-8 w-[150px] lg:w-[250px]' />
          <div className='flex gap-x-2'>
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
              {dataColumns.map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
              ))}
              {showActions && <TableHead className='w-[50px]' />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className='group/row'>
                <TableCell>
                  <Skeleton className='h-4 w-4' />
                </TableCell>
                {dataColumns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <Skeleton className='h-8 w-8 rounded-md' />
                  </TableCell>
                )}
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
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className='h-8 w-8' />
          ))}
        </div>
      </div>
    </div>
  )
}
