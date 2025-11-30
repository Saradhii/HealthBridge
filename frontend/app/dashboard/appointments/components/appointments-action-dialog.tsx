'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { appointmentTypes, appointmentStatuses } from '../data/data'
import { type Appointment } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useAppointments } from './appointments-provider'
import type { PatientFromDB } from '@/lib/types'

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient is required.'),
  appointmentDate: z.string().min(1, 'Appointment date is required.'),
  type: z.string().min(1, 'Type is required.'),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
  notes: z.string().optional(),
})

type AppointmentForm = z.infer<typeof formSchema>

type AppointmentActionDialogProps = {
  currentRow?: Appointment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppointmentsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AppointmentActionDialogProps) {
  const isEdit = !!currentRow
  const { refreshAppointments } = useAppointments()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<PatientFromDB[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          patientId: currentRow.patientId,
          appointmentDate: new Date(currentRow.appointmentDate)
            .toISOString()
            .slice(0, 16),
          type: currentRow.type,
          status: currentRow.status,
          notes: currentRow.notes || '',
        }
      : {
          patientId: '',
          appointmentDate: '',
          type: 'consultation',
          status: 'scheduled',
          notes: '',
        },
  })

  // Load patients when dialog opens
  useEffect(() => {
    if (open && !isEdit) {
      loadPatients()
    }
  }, [open, isEdit])

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

  const onSubmit = async (values: AppointmentForm) => {
    try {
      setIsSubmitting(true)

      // Convert local datetime to ISO string for API
      const appointmentDate = new Date(values.appointmentDate).toISOString()

      if (isEdit) {
        await apiClient.updateAppointment(currentRow.id, {
          ...values,
          appointmentDate,
          type: values.type as 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'vaccination' | 'surgery' | 'therapy' | 'diagnostic',
        })
        toast.success('Appointment updated successfully')
      } else {
        await apiClient.createAppointment({
          ...values,
          appointmentDate,
          type: values.type as 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'vaccination' | 'surgery' | 'therapy' | 'diagnostic',
        })
        toast.success('Appointment created successfully')
      }

      form.reset()
      refreshAppointments()
      onOpenChange(false)
    } catch (error) {
      toast.error(isEdit ? 'Failed to update appointment' : 'Failed to create appointment')
      console.error('Submit error:', error)
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
          <DialogTitle>
            {isEdit ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the appointment details here. '
              : 'Create a new appointment here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='appointment-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              {!isEdit && (
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
              )}

              {isEdit && (
                <div className='grid grid-cols-6 items-center gap-x-4'>
                  <label className='col-span-2 text-sm font-medium text-end'>
                    Patient
                  </label>
                  <div className='col-span-4 text-sm text-muted-foreground'>
                    {currentRow.patient.firstName} {currentRow.patient.lastName}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name='appointmentDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Date & Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
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
                name='type'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Type</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select type'
                      className='col-span-4'
                      items={appointmentTypes}
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
                      items={appointmentStatuses}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional notes...'
                        className='col-span-4 min-h-[100px]'
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
          <Button type='submit' form='appointment-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
