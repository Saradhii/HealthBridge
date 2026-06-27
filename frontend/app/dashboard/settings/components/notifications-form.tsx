'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'

const STORAGE_KEY = 'healthbridge.notifications'

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  labResultAlerts: z.boolean(),
  systemUpdates: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

const defaultValues: NotificationsFormValues = {
  emailNotifications: true,
  appointmentReminders: true,
  labResultAlerts: true,
  systemUpdates: false,
}

const toggles: Array<{
  name: keyof NotificationsFormValues
  label: string
  description: string
}> = [
  {
    name: 'emailNotifications',
    label: 'Email notifications',
    description: 'Receive important updates and alerts via email.',
  },
  {
    name: 'appointmentReminders',
    label: 'Appointment reminders',
    description: 'Get reminders for upcoming patient appointments.',
  },
  {
    name: 'labResultAlerts',
    label: 'Lab result alerts',
    description: 'Be notified when new lab results become available.',
  },
  {
    name: 'systemUpdates',
    label: 'System updates',
    description: 'Receive announcements about new features and maintenance.',
  },
]

export function NotificationsForm() {
  const [mounted, setMounted] = useState(false)

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  })

  // Hydrate preferences from localStorage on the client only.
  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = notificationsFormSchema.partial().parse(JSON.parse(stored))
        form.reset({ ...defaultValues, ...parsed })
      } catch {
        // Ignore malformed stored preferences and keep defaults.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  function onSubmit(data: NotificationsFormValues) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    toast.success('Notification preferences saved')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='space-y-4'>
          {toggles.map((toggle) => (
            <FormField
              key={toggle.name}
              control={form.control}
              name={toggle.name}
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>{toggle.label}</FormLabel>
                    <FormDescription>{toggle.description}</FormDescription>
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
          ))}
        </div>

        <Button type='submit'>Update notifications</Button>
      </form>
    </Form>
  )
}
