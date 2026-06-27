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
import { procedureStatuses } from '../data/data'
import { type Procedure } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useProcedures } from './procedures-provider'
import type { PatientFromDB } from '@/lib/types'

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient is required.'),
  name: z.string().min(1, 'Procedure name is required.'),
  category: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  scheduledDate: z.string().min(1, 'Scheduled date is required.'),
  completedDate: z.string().optional(),
  outcome: z.string().optional(),
  notes: z.string().optional(),
})

type ProcedureForm = z.infer<typeof formSchema>

type ProcedureActionDialogProps = {
  currentRow?: Procedure
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProceduresActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ProcedureActionDialogProps) {
  const isEdit = !!currentRow
  const { refresh } = useProcedures()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<PatientFromDB[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)

  const form = useForm<ProcedureForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          patientId: currentRow.patientId,
          name: currentRow.name,
          category: currentRow.category || '',
          status: currentRow.status,
          scheduledDate: new Date(currentRow.scheduledDate)
            .toISOString()
            .slice(0, 16),
          completedDate: currentRow.completedDate
            ? new Date(currentRow.completedDate).toISOString().slice(0, 16)
            : '',
          outcome: currentRow.outcome || '',
          notes: currentRow.notes || '',
        }
      : {
          patientId: '',
          name: '',
          category: '',
          status: 'scheduled',
          scheduledDate: '',
          completedDate: '',
          outcome: '',
          notes: '',
        },
  })

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

  const onSubmit = async (values: ProcedureForm) => {
    try {
      setIsSubmitting(true)

      const payload = {
        patientId: values.patientId,
        name: values.name,
        category: values.category || null,
        status: values.status,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
        completedDate: values.completedDate
          ? new Date(values.completedDate).toISOString()
          : null,
        outcome: values.outcome || null,
        notes: values.notes || null,
      }

      if (isEdit) {
        await apiClient.updateProcedure(currentRow.id, payload)
        toast.success('Procedure updated successfully')
      } else {
        await apiClient.createProcedure(payload)
        toast.success('Procedure created successfully')
      }

      form.reset()
      refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        isEdit ? 'Failed to update procedure' : 'Failed to create procedure'
      )
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
            {isEdit ? 'Edit Procedure' : 'New Procedure'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the procedure details here. '
              : 'Schedule a new procedure here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='procedure-form'
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
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Procedure
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Appendectomy'
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
                name='category'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Category
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Surgical'
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
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      className='col-span-4'
                      items={procedureStatuses.map((s) => ({
                        label: s.label,
                        value: s.value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='scheduledDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Scheduled
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
                name='completedDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Completed
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
                name='outcome'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>
                      Outcome
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Procedure outcome...'
                        className='col-span-4 min-h-[60px]'
                        {...field}
                      />
                    </FormControl>
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
                        className='col-span-4 min-h-[60px]'
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
          <Button type='submit' form='procedure-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
