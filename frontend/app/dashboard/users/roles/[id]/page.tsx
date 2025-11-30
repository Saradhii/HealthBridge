'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api'
import { type Role } from '@/lib/types'
import { toast } from 'sonner'

function RoleDetailsSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-24 w-full' />
      <div className='grid gap-6 md:grid-cols-2'>
        <Skeleton className='h-64 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    </div>
  )
}

export default function RoleDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string

  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchRoleDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRole(roleId)
      setRole(response.role)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch role details')
      router.push('/dashboard/users/roles')
    } finally {
      setLoading(false)
    }
  }, [roleId, router])

  useEffect(() => {
    if (roleId) {
      fetchRoleDetails()
    }
  }, [roleId, fetchRoleDetails])

  
  const handleDelete = async () => {
    if (!role) return

    try {
      setDeleting(true)
      await apiClient.deleteRole(role.id)
      toast.success('Role deleted successfully')
      router.push('/dashboard/users/roles')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete role')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const groupPermissionsByResource = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {}
    permissions.forEach((perm) => {
      const [resource, action] = perm.split(':')
      if (!grouped[resource]) {
        grouped[resource] = []
      }
      grouped[resource].push(action)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className='flex flex-1 flex-col gap-6'>
        <RoleDetailsSkeleton />
      </div>
    )
  }

  if (!role) {
    return null
  }

  const groupedPermissions = groupPermissionsByResource(role.permissions)

  return (
    <div className='flex flex-1 flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => router.push('/dashboard/users/roles')}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h2 className='text-2xl font-bold tracking-tight'>{role.name}</h2>
            <Badge variant={role.isSystemRole ? 'default' : 'outline'}>
              {role.isSystemRole ? 'System' : 'Custom'}
            </Badge>
          </div>
          <p className='text-muted-foreground ps-10'>
            {role.description || 'No description provided'}
          </p>
        </div>

        {!role.isSystemRole && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => router.push(`/dashboard/users/roles/${role.id}/edit`)}
            >
              <Pencil className='mr-2 h-4 w-4' />
              Edit Role
            </Button>
            <Button
              variant='destructive'
              onClick={() => setShowDeleteDialog(true)}
              disabled={role.userCount && role.userCount > 0}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Role
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Slug</div>
              <code className='mt-1 block rounded bg-muted px-2 py-1 text-sm'>{role.slug}</code>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Hierarchy Level</div>
              <p className='mt-1 text-2xl font-bold'>{role.hierarchyLevel}</p>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Total Users</div>
              <p className='mt-1 text-2xl font-bold'>{role.userCount || 0}</p>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Created At</div>
              <p className='mt-1'>{new Date(role.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              {Object.keys(groupedPermissions).length} resources with permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(groupedPermissions).map(([resource, actions]) => (
                <div key={resource} className='space-y-1'>
                  <div className='text-sm font-medium'>{resource}</div>
                  <div className='flex flex-wrap gap-1'>
                    {actions.map((action) => (
                      <Badge key={action} variant='secondary' className='text-xs'>
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users with this role */}
        {role.users && role.users.length > 0 && (
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Users with this Role
              </CardTitle>
              <CardDescription>
                Showing {role.users.length} of {role.userCount} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {role.users.map((user) => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div>
                      <div className='font-medium'>{user.name}</div>
                      <div className='text-sm text-muted-foreground'>{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role &quot;{role.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
