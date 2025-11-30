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
import { type User } from '../data/schema'
import { apiClient } from '@/lib/api'
import { useState } from 'react'
import { doctorSpecializations, doctorDepartments, shifts } from '../data/data'

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
  })

type DoctorForm = z.infer<typeof formSchema>

type DoctorActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // Callback to refresh doctor list
}

export function DoctorsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: DoctorActionDialogProps) {
  const isEdit = !!currentRow
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<DoctorForm>({
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
    },
  })

  const onSubmit = async (values: DoctorForm) => {
    setIsLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    // Convert empty strings to null for nullable fields to match backend expectations
    const payload = {
      ...values,
      roleIds: ['doctor'], // Always assign doctor role
      department: values.department || null,
      specialization: values.specialization || null,
      shift: values.shift || null,
    }

    try {
      if (isEdit && currentRow) {
        // TODO: Implement update doctor functionality
        console.log('Update doctor:', payload)
        setSuccessMessage('Doctor updated successfully!')
      } else {
        // Create new doctor
        const response = await apiClient.createUser(payload)
        console.log('Created doctor:', response)

        // Show success message with temporary password
        setSuccessMessage(
          `Doctor created successfully! Temporary password: ${response.tempPassword}`
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
        })

        // Call success callback to refresh doctor list
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
      console.error('Error saving doctor:', error)
      // Show error message to user
      const errorMsg = error instanceof Error ? error.message : 'Failed to create doctor'
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
          <DialogTitle>{isEdit ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the doctor information here. Click save when you&apos;re done.'
              : 'Create a new doctor account. The system will generate a temporary password that the doctor can change on first login.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='doctor-form'
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
                        placeholder='Dr. John Smith'
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
                        placeholder='dr.smith@hospital.com'
                        autoComplete='off'
                        {...field}
                      />
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
                    <SelectDropdown
                      defaultValue={field.value || undefined}
                      onValueChange={field.onChange}
                      placeholder='Select specialization'
                      items={doctorSpecializations.map((spec) => ({
                        label: spec,
                        value: spec,
                      }))}
                    />
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
                    <SelectDropdown
                      defaultValue={field.value || undefined}
                      onValueChange={field.onChange}
                      placeholder='Select department'
                      items={doctorDepartments.map((dept) => ({
                        label: dept,
                        value: dept,
                      }))}
                    />
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
                      defaultValue={field.value || undefined}
                      onValueChange={field.onChange}
                      placeholder='Select shift'
                      items={shifts.map((shift) => ({
                        label: shift,
                        value: shift,
                      }))}
                    />
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
                        Doctor can login and access the system
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
                        Doctor must change password on first login
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
          <Button type='submit' form='doctor-form' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Doctor' : 'Create Doctor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}