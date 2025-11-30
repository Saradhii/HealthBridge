'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import { useRoles } from '@/lib/hooks/use-roles'
import { type User } from '../data/schema'
import { apiClient } from '@/lib/api'
import { useState } from 'react'

const departmentsList = [
  'Emergency',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Radiology',
  'Oncology',
  'General Surgery',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Dermatology',
  'ENT (Ear, Nose & Throat)',
  'Ophthalmology',
  'Nephrology',
  'Gastroenterology',
  'Administration',
  'Pharmacy',
]

const shiftsList = ['Morning', 'Evening', 'Night']

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    department: z.string().nullable().optional(),
    specialization: z.string().nullable().optional(),
    shift: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    emailVerified: z.boolean().default(true),
    forcePasswordChange: z.boolean().default(false),
    roleIds: z.array(z.string()).min(1, 'At least one role is required.'),
  })

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // Callback to refresh user list
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: currentRow?.name || '',
      email: currentRow?.email || '',
      department: currentRow?.department || '',
      specialization: currentRow?.specialization || '',
      shift: currentRow?.shift || '',
      isActive: currentRow?.status === 'active' ? true : true,
      emailVerified: true,
      forcePasswordChange: false,
      roleIds: currentRow?.roles.map(r => r.id) || [],
    },
  })

  const onSubmit = async (values: UserForm) => {
    setIsLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    // Convert empty strings to null for nullable fields to match backend expectations
    const payload = {
      ...values,
      department: values.department || null,
      specialization: values.specialization || null,
      shift: values.shift || null,
    }

    // Debug logging to verify role IDs
    console.log('Form values being submitted:', {
      ...payload,
      roleIds: payload.roleIds,
      roleIdsType: payload.roleIds.map(id => typeof id),
    })

    try {
      if (isEdit && currentRow) {
        // TODO: Implement update user functionality
        console.log('Update user:', payload)
        setSuccessMessage('User updated successfully!')
      } else {
        // Create new user
        const response = await apiClient.createUser(payload)
        console.log('Created user:', response)

        // Show success message with temporary password
        setSuccessMessage(
          `User created successfully! Temporary password: ${response.tempPassword}`
        )

        // Reset form after successful creation
        form.reset({
          name: '',
          email: '',
          department: '',
          specialization: '',
          shift: '',
          isActive: true,
          emailVerified: true,
          forcePasswordChange: false,
          roleIds: [],
        })

        // Call success callback to refresh user list
        if (onSuccess) {
          onSuccess()
        }

        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onOpenChange(false)
          setSuccessMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving user:', error)
      // Show error message to user
      const errorMsg = error instanceof Error ? error.message : 'Failed to create user'
      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
          setSuccessMessage(null)
          setErrorMessage(null)
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the user information here. Click save when you&apos;re done.'
              : 'Create a new user account. The system will generate a temporary password that the user can change on first login.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              {/* Name Field */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john.doe@hospital.com'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department Field */}
              <FormField
                control={form.control}
                name='department'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          placeholder='Select or enter department'
                          list='departments'
                          autoComplete='off'
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        <datalist id='departments'>
                          {departmentsList.map((dept) => (
                            <option key={dept} value={dept} />
                          ))}
                        </datalist>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specialization Field */}
              <FormField
                control={form.control}
                name='specialization'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='e.g., Cardiology, Pediatric Nursing, Clinical Pharmacy'
                        className='resize-none'
                        rows={2}
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shift Field */}
              <FormField
                control={form.control}
                name='shift'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder='Select shift'
                      items={shiftsList.map((shift) => ({
                        label: shift,
                        value: shift,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roles Field */}
              <FormField
                control={form.control}
                name='roleIds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <div className='space-y-2'>
                      {rolesLoading ? (
                        <div className='text-sm text-muted-foreground'>Loading roles...</div>
                      ) : rolesError ? (
                        <div className='text-sm text-destructive'>Failed to load roles: {rolesError}</div>
                      ) : roles.length === 0 ? (
                        <div className='text-sm text-muted-foreground'>No roles available. Please create roles first.</div>
                      ) : (
                        roles.map((role) => (
                          <div key={role.id} className='flex items-center space-x-2'>
                            <input
                              type='checkbox'
                              id={role.id}
                              checked={(field.value || []).includes(role.id)}
                              onChange={(e) => {
                                const currentValue = field.value || []
                                if (e.target.checked) {
                                  field.onChange([...currentValue, role.id])
                                } else {
                                  field.onChange(
                                    currentValue.filter((val) => val !== role.id)
                                  )
                                }
                              }}
                              className='rounded border-gray-300'
                            />
                            <label
                              htmlFor={role.id}
                              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              {role.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Active Status</FormLabel>
                      <p className='text-sm text-muted-foreground'>
                        User can login and access the system
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Force Password Change */}
              <FormField
                control={form.control}
                name='forcePasswordChange'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Force Password Change</FormLabel>
                      <p className='text-sm text-muted-foreground'>
                        User must change password on first login
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className='rounded-md bg-green-50 p-4 mb-4'>
            <p className='text-sm text-green-800'>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className='rounded-md bg-red-50 p-4 mb-4'>
            <p className='text-sm text-red-800'>{errorMessage}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' form='user-form' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}