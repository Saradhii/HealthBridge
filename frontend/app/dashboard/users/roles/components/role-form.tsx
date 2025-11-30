'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api'
import { type Role, type CreateRoleRequest, type UpdateRoleRequest } from '@/lib/types'
import { toast } from 'sonner'
import { PermissionSelector } from './permission-selector'

type RoleFormProps = {
  mode: 'create' | 'edit'
  initialData?: Role
}

export function RoleForm({ mode, initialData }: RoleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    hierarchyLevel: initialData?.hierarchyLevel || 10,
    permissions: initialData?.permissions || [],
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? generateSlug(name) : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.permissions.length === 0) {
      toast.error('Please select at least one permission')
      return
    }

    if (formData.hierarchyLevel < 1 || formData.hierarchyLevel > 79) {
      toast.error('Hierarchy level must be between 1 and 79')
      return
    }

    try {
      setLoading(true)

      if (mode === 'create') {
        const request: CreateRoleRequest = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          permissions: formData.permissions,
          hierarchyLevel: formData.hierarchyLevel,
        }
        await apiClient.createRole(request)
        toast.success('Role created successfully')
      } else if (initialData) {
        const request: UpdateRoleRequest = {
          name: formData.name,
          description: formData.description || undefined,
          permissions: formData.permissions,
          hierarchyLevel: formData.hierarchyLevel,
        }
        await apiClient.updateRole(initialData.id, request)
        toast.success('Role updated successfully')
      }

      router.push('/dashboard/users/roles')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} role`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-1 flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => router.push('/dashboard/users/roles')}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h2 className='text-2xl font-bold tracking-tight'>
          {mode === 'create' ? 'Create Custom Role' : 'Edit Role'}
        </h2>
      </div>

      <Alert>
        <AlertDescription>
          {mode === 'create'
            ? 'Create a new custom role with specific permissions. Custom roles have a hierarchy level between 1-79.'
            : 'Update the role details. System roles cannot be modified.'}
        </AlertDescription>
      </Alert>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define the role name, slug, and description</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Role Name <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder='e.g., Medical Intern'
                required
                minLength={2}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>
                Slug <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='slug'
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder='e.g., medical_intern'
                required
                disabled={mode === 'edit'}
                pattern='^[a-z0-9_]+$'
                title='Only lowercase letters, numbers, and underscores'
              />
              <p className='text-xs text-muted-foreground'>
                {mode === 'edit' ? 'Slug cannot be changed' : 'Auto-generated from name, can be customized'}
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder='Brief description of this role and its responsibilities'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='hierarchyLevel'>
              Hierarchy Level <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='hierarchyLevel'
              type='number'
              value={formData.hierarchyLevel}
              onChange={(e) => setFormData({ ...formData, hierarchyLevel: parseInt(e.target.value) })}
              min={1}
              max={79}
              required
            />
            <p className='text-xs text-muted-foreground'>
              Higher level = more authority (1-79 for custom roles, 80+ reserved for system roles)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <PermissionSelector
        selectedPermissions={formData.permissions}
        onChange={(permissions) => setFormData({ ...formData, permissions })}
      />

      {/* Actions */}
      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/users/roles')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Update Role'}
        </Button>
      </div>
    </form>
  )
}
