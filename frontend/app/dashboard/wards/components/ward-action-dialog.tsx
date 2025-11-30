'use client'

import { useState } from 'react'
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
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { type Ward } from '../data/schema'
import { useWards } from './wards-provider'

const formSchema = z.object({
  name: z.string().min(1, 'Ward name is required'),
  department: z.string().optional(),
  floor: z.string().optional(),
  totalBeds: z.coerce.number().min(1, 'Total beds must be at least 1'),
})

type WardForm = z.infer<typeof formSchema>

type WardActionDialogProps = {
  currentWard?: Ward
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WardActionDialog({
  currentWard,
  open,
  onOpenChange,
}: WardActionDialogProps) {
  const isEdit = !!currentWard
  const { refreshWards } = useWards()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WardForm>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: isEdit
      ? {
          name: currentWard.name,
          department: currentWard.department || '',
          floor: currentWard.floor || '',
          totalBeds: currentWard.totalBeds,
        }
      : {
          name: '',
          department: '',
          floor: '',
          totalBeds: 10,
        },
  })

  const onSubmit = async (values: WardForm) => {
    try {
      setIsSubmitting(true)

      if (isEdit) {
        await apiClient.updateWard(currentWard.id, {
          name: values.name,
          department: values.department || null,
          floor: values.floor || null,
          totalBeds: values.totalBeds,
        })

        toast.success('Ward updated successfully')
      } else {
        await apiClient.createWard({
          name: values.name,
          department: values.department || null,
          floor: values.floor || null,
          totalBeds: values.totalBeds,
        })

        toast.success('Ward created successfully')
      }

      form.reset()
      onOpenChange(false)
      refreshWards()
    } catch (error) {
      console.error('Failed to save ward:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save ward')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Ward' : 'Add New Ward'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update ward details. '
              : 'Create a new ward in your hospital. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='w-full py-1'>
          <Form {...form}>
            <form
              id='ward-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Ward Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., General Ward A'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='department'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Department
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., General Medicine'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='floor'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Floor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., 2nd Floor'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='totalBeds'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Total Beds
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='1'
                        placeholder='10'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='ward-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
