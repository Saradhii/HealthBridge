'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api'
import { type Permission } from '@/lib/types'
import { toast } from 'sonner'

type PermissionSelectorProps = {
  selectedPermissions: string[]
  onChange: (permissions: string[]) => void
}

export function PermissionSelector({ selectedPermissions, onChange }: PermissionSelectorProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPermissions()
      setPermissions(response.permissions)
    } catch (error) {
      toast.error('Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }

  const isPermissionSelected = (resource: string, action: string) => {
    return selectedPermissions.includes(`${resource}:${action}`)
  }

  const areAllActionsSelected = (resource: string, actions: string[]) => {
    return actions.every((action) => isPermissionSelected(resource, action))
  }

  const areSomeActionsSelected = (resource: string, actions: string[]) => {
    return actions.some((action) => isPermissionSelected(resource, action)) &&
      !areAllActionsSelected(resource, actions)
  }

  const togglePermission = (resource: string, action: string) => {
    const permission = `${resource}:${action}`
    const newPermissions = isPermissionSelected(resource, action)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission]
    onChange(newPermissions)
  }

  const toggleAllActions = (resource: string, actions: string[]) => {
    const allSelected = areAllActionsSelected(resource, actions)
    let newPermissions = [...selectedPermissions]

    if (allSelected) {
      // Remove all permissions for this resource
      actions.forEach((action) => {
        newPermissions = newPermissions.filter((p) => p !== `${resource}:${action}`)
      })
    } else {
      // Add all permissions for this resource
      actions.forEach((action) => {
        const permission = `${resource}:${action}`
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission)
        }
      })
    }

    onChange(newPermissions)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Loading available permissions...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <CardDescription>
          Select the permissions this role should have. Click on a resource name to select/deselect all actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6 sm:grid-cols-2'>
          {permissions.map((perm) => (
            <div key={perm.resource} className='space-y-3 rounded-lg border p-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id={`resource-${perm.resource}`}
                  checked={areAllActionsSelected(perm.resource, perm.actions)}
                  onCheckedChange={() => toggleAllActions(perm.resource, perm.actions)}
                  {...(areSomeActionsSelected(perm.resource, perm.actions) ? { 'data-state': 'indeterminate' } : {})}
                />
                <Label
                  htmlFor={`resource-${perm.resource}`}
                  className='cursor-pointer font-semibold'
                >
                  {perm.resource}
                </Label>
              </div>

              <div className='space-y-2 ps-6'>
                {perm.actions.map((action) => (
                  <div key={action} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`${perm.resource}-${action}`}
                      checked={isPermissionSelected(perm.resource, action)}
                      onCheckedChange={() => togglePermission(perm.resource, action)}
                    />
                    <Label
                      htmlFor={`${perm.resource}-${action}`}
                      className='cursor-pointer text-sm font-normal'
                    >
                      {action}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedPermissions.length > 0 && (
          <div className='mt-4 rounded-lg bg-muted p-4'>
            <div className='mb-2 flex items-center gap-2 text-sm font-medium'>
              <Check className='h-4 w-4 text-green-600' />
              Selected Permissions ({selectedPermissions.length})
            </div>
            <div className='flex flex-wrap gap-1'>
              {selectedPermissions.map((perm) => (
                <code key={perm} className='rounded bg-background px-2 py-1 text-xs'>
                  {perm}
                </code>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
