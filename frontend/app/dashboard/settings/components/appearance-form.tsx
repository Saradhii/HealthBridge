'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const FONT_STORAGE_KEY = 'healthbridge.appearance.font'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  font: z.enum(['sans', 'serif', 'mono']),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

const themeOptions: Array<{ value: AppearanceFormValues['theme']; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: 'system',
      font: 'sans',
    },
  })

  // next-themes resolves the active theme only on the client; sync once mounted.
  useEffect(() => {
    setMounted(true)
    const storedFont =
      (typeof window !== 'undefined' &&
        (localStorage.getItem(FONT_STORAGE_KEY) as
          | AppearanceFormValues['font']
          | null)) ||
      'sans'
    form.reset({
      theme: (theme as AppearanceFormValues['theme']) || 'system',
      font: storedFont,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  function onSubmit(data: AppearanceFormValues) {
    setTheme(data.theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_STORAGE_KEY, data.font)
    }
    toast.success('Appearance settings saved')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value)
                  // Apply the theme live as soon as it is selected.
                  setTheme(value)
                }}
                value={field.value}
                className='grid max-w-md grid-cols-3 gap-4 pt-2'
              >
                {themeOptions.map((option) => (
                  <FormItem key={option.value}>
                    <FormControl>
                      <RadioGroupItem
                        value={option.value}
                        id={`theme-${option.value}`}
                        className='sr-only'
                      />
                    </FormControl>
                    <Label
                      htmlFor={`theme-${option.value}`}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 text-sm font-medium hover:bg-accent',
                        field.value === option.value
                          ? 'border-primary'
                          : 'border-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'mb-2 h-10 w-full rounded',
                          option.value === 'light' && 'bg-[#ecedef]',
                          option.value === 'dark' && 'bg-slate-900',
                          option.value === 'system' &&
                            'bg-gradient-to-r from-[#ecedef] to-slate-900'
                        )}
                      />
                      {option.label}
                    </Label>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='max-w-md'>
                    <SelectValue placeholder='Select a font' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='sans'>Sans Serif</SelectItem>
                  <SelectItem value='serif'>Serif</SelectItem>
                  <SelectItem value='mono'>Monospace</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set the font you want to use across the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Update preferences</Button>
      </form>
    </Form>
  )
}
