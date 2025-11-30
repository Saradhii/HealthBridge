'use client'

import { useRef, useEffect } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  searchValue?: string // For server-side controlled search
  onSearchChange?: (value: string) => void // For server-side search handling
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  searchValue,
  onSearchChange,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const wasFocused = useRef(false)

  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter || (searchValue !== undefined && searchValue !== '')

  // Preserve focus state
  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    const handleFocus = () => {
      wasFocused.current = true
    }
    const handleBlur = () => {
      wasFocused.current = false
    }

    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)

    return () => {
      input.removeEventListener('focus', handleFocus)
      input.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Restore focus after re-render if it was focused
  useEffect(() => {
    if (wasFocused.current && inputRef.current) {
      inputRef.current.focus()
    }
  })

  // Determine search input value and handler
  const getSearchInputValue = () => {
    if (searchValue !== undefined) return searchValue // Server-side controlled
    if (searchKey) return (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
    return table.getState().globalFilter ?? ''
  }

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value) // Server-side handler
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value)
    } else {
      table.setGlobalFilter(value)
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          ref={inputRef}
          placeholder={searchPlaceholder}
          value={getSearchInputValue()}
          onChange={(event) => handleSearchChange(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null

            const currentValue = ((column.getFilterValue() as string[]) ?? [])[0] ?? ''

            return (
              <Select
                key={filter.columnId}
                value={currentValue || undefined}
                onValueChange={(value) => {
                  column.setFilterValue([value])
                }}
              >
                <SelectTrigger className='h-8 w-[138px]'>
                  <SelectValue placeholder={filter.title} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
              if (onSearchChange) {
                onSearchChange('') // Reset server-side search
              }
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}
