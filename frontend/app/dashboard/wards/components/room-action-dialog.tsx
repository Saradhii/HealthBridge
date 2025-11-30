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
import { SelectDropdown } from '@/components/select-dropdown'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { type Room, type Ward } from '../data/schema'
import { useWards } from './wards-provider'

const bedTypes = [
  { label: 'General', value: 'general' },
  { label: 'ICU', value: 'icu' },
  { label: 'Private', value: 'private' },
  { label: 'Semi-Private', value: 'semi-private' },
]

const roomStatuses = [
  { label: 'Vacant', value: 'vacant' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
]

const formSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  bedType: z.enum(['general', 'icu', 'private', 'semi-private']),
  status: z.enum(['vacant', 'occupied', 'maintenance']),
  wardId: z.string().min(1, 'Please select a ward'),
})

type RoomForm = z.infer<typeof formSchema>

type RoomActionDialogProps = {
  currentRoom?: Room
  wards: Ward[]
  defaultWardId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoomActionDialog({
  currentRoom,
  wards,
  defaultWardId,
  open,
  onOpenChange,
}: RoomActionDialogProps) {
  const isEdit = !!currentRoom
  const { refreshWards } = useWards()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RoomForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          roomNumber: currentRoom.roomNumber,
          bedType: currentRoom.bedType,
          status: currentRoom.status,
          wardId: defaultWardId || '',
        }
      : {
          roomNumber: '',
          bedType: 'general',
          status: 'vacant',
          wardId: defaultWardId || '',
        },
  })

  const onSubmit = async (values: RoomForm) => {
    try {
      setIsSubmitting(true)

      if (isEdit) {
        await apiClient.updateRoom(currentRoom.id, {
          roomNumber: values.roomNumber,
          bedType: values.bedType,
          status: values.status,
        })

        toast.success('Room updated successfully')
      } else {
        await apiClient.createRoom({
          wardId: values.wardId,
          roomNumber: values.roomNumber,
          bedType: values.bedType,
          status: values.status,
        })

        toast.success('Room created successfully')
      }

      form.reset()
      onOpenChange(false)
      refreshWards()
    } catch (error) {
      console.error('Failed to save room:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save room')
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
          <DialogTitle>{isEdit ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update room details. '
              : 'Create a new room in the ward. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='w-full py-1'>
          <Form {...form}>
            <form
              id='room-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='wardId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Ward</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a ward'
                      className='col-span-4'
                      items={wards.map((ward) => ({
                        label: ward.name,
                        value: ward.id,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roomNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Room Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., 201'
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
                name='bedType'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Bed Type
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select bed type'
                      className='col-span-4'
                      items={bedTypes}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      className='col-span-4'
                      items={roomStatuses}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='room-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
