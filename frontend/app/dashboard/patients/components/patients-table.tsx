'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  type ColumnFiltersState,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { type Patient } from '../data/schema'
import { type GetPatientsResponse } from '@/lib/types'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { patientsColumns } from './patients-columns'
import { genders, bloodGroups, statuses } from '../data/data'

interface PatientsFilters {
  search: string
  gender: string
  bloodGroup: string
  isActive: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

type PatientsTableProps = {
  data: Patient[]
  pagination: GetPatientsResponse['pagination']
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  filters: PatientsFilters
  updateFilters: (filters: Partial<PatientsFilters>) => void
}

export function PatientsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  filters,
  updateFilters,
}: PatientsTableProps) {
  // Local search state for debouncing before hitting the server.
  const [searchValue, setSearchValue] = useState(filters.search)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) {
        updateFilters({ search: searchValue })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchValue, filters.search, updateFilters])

  // Sync search value when filters change externally.
  useEffect(() => {
    setSearchValue(filters.search)
  }, [filters.search])

  // Mirror server-side filters into the table column-filter state.
  useEffect(() => {
    const newColumnFilters: ColumnFiltersState = []
    if (filters.gender) {
      newColumnFilters.push({ id: 'gender', value: [filters.gender] })
    }
    if (filters.bloodGroup) {
      newColumnFilters.push({ id: 'bloodGroup', value: [filters.bloodGroup] })
    }
    if (filters.isActive) {
      newColumnFilters.push({
        id: 'status',
        value: [filters.isActive === 'true' ? 'active' : 'inactive'],
      })
    }
    setColumnFilters(newColumnFilters)
  }, [filters.gender, filters.bloodGroup, filters.isActive])

  const handleColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const newFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)

      const filterUpdates: Partial<PatientsFilters> = {
        gender: '',
        bloodGroup: '',
        isActive: '',
      }
      newFilters.forEach((filter) => {
        const value = (filter.value as string[] | undefined)?.[0]
        if (!value) return
        if (filter.id === 'gender') {
          filterUpdates.gender = value
        } else if (filter.id === 'bloodGroup') {
          filterUpdates.bloodGroup = value
        } else if (filter.id === 'status') {
          filterUpdates.isActive = value === 'active' ? 'true' : 'false'
        }
      })
      updateFilters(filterUpdates)
    },
    [columnFilters, updateFilters]
  )

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const current: SortingState = [
        { id: filters.sortBy, desc: filters.sortOrder === 'desc' },
      ]
      const newSorting =
        typeof updater === 'function' ? updater(current) : updater
      if (newSorting[0]) {
        onSortChange(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      }
    },
    [filters.sortBy, filters.sortOrder, onSortChange]
  )

  return (
    <DataTable
      columns={patientsColumns}
      data={data}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage='No patients found.'
      searchPlaceholder='Search patients by name, email, phone...'
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      sorting={[{ id: filters.sortBy, desc: filters.sortOrder === 'desc' }]}
      onSortingChange={handleSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={handleColumnFiltersChange}
      manualSorting
      manualFiltering
      filters={[
        {
          columnId: 'gender',
          title: 'Gender',
          options: genders.map((g) => ({ ...g })),
        },
        {
          columnId: 'bloodGroup',
          title: 'Blood Group',
          options: bloodGroups.map((bg) => ({ ...bg })),
        },
        {
          columnId: 'status',
          title: 'Status',
          options: statuses.map((s) => ({ ...s })),
        },
      ]}
      bulkActions={(table) => <DataTableBulkActions table={table} />}
    />
  )
}
