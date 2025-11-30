'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must not be longer than 100 characters.'),
  email: z.string().email(),
  department: z.string().nullable(),
  specialization: z.string().nullable(),
  shift: z.string().nullable(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user: {
    id: string
    email: string
    name: string
    department?: string | null
    specialization?: string | null
    shift?: string | null
    tenantId?: string
    forcePasswordChange?: boolean
    roles: Array<{ name: string; slug: string }>
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { setTokens, accessToken, refreshToken } = useAuthStore()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      department: user.department || '',
      specialization: user.specialization || '',
      shift: user.shift || '',
    },
    mode: 'onChange',
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true)
      setMessage(null)

      const response = await apiClient.updateCurrentUser({
        name: data.name,
        department: data.department || null,
        specialization: data.specialization || null,
        shift: data.shift || null,
      })

      // Update the user in the auth store
      if (accessToken && refreshToken) {
        const updatedUser = {
          id: user.id,
          email: user.email,
          name: response.user.name,
          department: response.user.department,
          specialization: response.user.specialization,
          shift: response.user.shift,
          tenantId: user.tenantId || '',
          roles: user.roles.map(r => r.slug),
          forcePasswordChange: user.forcePasswordChange || false,
        }
        setTokens(accessToken, refreshToken, updatedUser)
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormDescription>
                This is your display name. It will be visible to other staff members.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                Your email address cannot be changed. Contact your administrator if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='department'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a department' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='Emergency'>Emergency</SelectItem>
                  <SelectItem value='Cardiology'>Cardiology</SelectItem>
                  <SelectItem value='Neurology'>Neurology</SelectItem>
                  <SelectItem value='Pediatrics'>Pediatrics</SelectItem>
                  <SelectItem value='Orthopedics'>Orthopedics</SelectItem>
                  <SelectItem value='Radiology'>Radiology</SelectItem>
                  <SelectItem value='Oncology'>Oncology</SelectItem>
                  <SelectItem value='General Surgery'>General Surgery</SelectItem>
                  <SelectItem value='ICU'>ICU</SelectItem>
                  <SelectItem value='Administration'>Administration</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Your primary department within the hospital.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='specialization'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g., Cardiac Surgery, Trauma Care'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Your area of medical specialization or expertise.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='shift'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select your shift' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='Morning'>Morning (7 AM - 3 PM)</SelectItem>
                  <SelectItem value='Evening'>Evening (3 PM - 11 PM)</SelectItem>
                  <SelectItem value='Night'>Night (11 PM - 7 AM)</SelectItem>
                  <SelectItem value='Rotating'>Rotating</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Your current work shift schedule.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            Roles
          </label>
          <div className='mt-2 flex flex-wrap gap-2'>
            {user.roles.map((role) => (
              <Badge key={role.slug} variant='secondary'>
                {role.name}
              </Badge>
            ))}
          </div>
          <p className='text-muted-foreground text-sm mt-2'>
            Your assigned roles determine your permissions. Contact your administrator to change roles.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-md p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update profile'}
        </Button>
      </form>
    </Form>
  )
}
