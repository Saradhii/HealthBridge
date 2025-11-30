'use client'

import { useState, useEffect } from 'react'
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
import { type Room } from '../data/schema'
import { useWards } from './wards-provider'
import type { PatientFromDB } from '@/lib/types'

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  expectedCheckOut: z.string().optional(),
})

type AssignPatientForm = z.infer<typeof formSchema>

type AssignPatientDialogProps = {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignPatientDialog({
  room,
  open,
  onOpenChange,
}: AssignPatientDialogProps) {
  const { refreshWards } = useWards()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<PatientFromDB[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)

  const form = useForm<AssignPatientForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      checkIn: new Date().toISOString().split('T')[0],
      expectedCheckOut: '',
    },
  })

  // Load patients when dialog opens
  useEffect(() => {
    if (open) {
      loadPatients()
    }
  }, [open])

  const loadPatients = async () => {
    try {
      setIsLoadingPatients(true)
      const response = await apiClient.getPatients({ limit: 100 })
      setPatients(response.patients)
    } catch (error) {
      toast.error('Failed to load patients')
      console.error('Load patients error:', error)
    } finally {
      setIsLoadingPatients(false)
    }
  }

  const onSubmit = async (values: AssignPatientForm) => {
    if (!room) return

    try {
      setIsSubmitting(true)

      // Convert dates to ISO string
      const checkInDate = new Date(values.checkIn).toISOString()
      const expectedCheckOutDate = values.expectedCheckOut
        ? new Date(values.expectedCheckOut).toISOString()
        : null

      await apiClient.assignPatientToRoom(room.id, {
        patientId: values.patientId,
        checkIn: checkInDate,
        expectedCheckOut: expectedCheckOutDate,
      })

      toast.success('Patient assigned successfully')

      form.reset()
      onOpenChange(false)
      refreshWards()
    } catch (error) {
      console.error('Failed to assign patient:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to assign patient')
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
          <DialogTitle>Assign Patient to Room</DialogTitle>
          <DialogDescription>
            Assign a patient to Room {room?.roomNumber}.
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='w-full py-1'>
          <Form {...form}>
            <form
              id='assign-patient-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='patientId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Patient
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select patient'
                      className='col-span-4'
                      items={patients.map((patient) => ({
                        label: `${patient.firstName} ${patient.lastName}`,
                        value: patient.id,
                      }))}
                      disabled={isLoadingPatients}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='checkIn'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Check-In Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='expectedCheckOut'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Expected Check-Out
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='date'
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
          <Button type='submit' form='assign-patient-form' disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
