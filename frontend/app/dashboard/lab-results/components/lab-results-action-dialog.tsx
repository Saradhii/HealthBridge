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
import { labResultStatuses } from '../data/data'
import { type LabResult } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useLabResults } from './lab-results-provider'
import type { PatientFromDB } from '@/lib/types'

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient is required.'),
  testName: z.string().min(1, 'Test name is required.'),
  category: z.string().optional(),
  status: z.enum(['ordered', 'in_progress', 'completed', 'cancelled']),
  resultValue: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  orderedDate: z.string().min(1, 'Ordered date is required.'),
  resultDate: z.string().optional(),
  notes: z.string().optional(),
})

type LabResultForm = z.infer<typeof formSchema>

type LabResultActionDialogProps = {
  currentRow?: LabResult
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LabResultsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: LabResultActionDialogProps) {
  const isEdit = !!currentRow
  const { refresh } = useLabResults()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<PatientFromDB[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)

  const form = useForm<LabResultForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          patientId: currentRow.patientId,
          testName: currentRow.testName,
          category: currentRow.category || '',
          status: currentRow.status,
          resultValue: currentRow.resultValue || '',
          unit: currentRow.unit || '',
          referenceRange: currentRow.referenceRange || '',
          orderedDate: new Date(currentRow.orderedDate)
            .toISOString()
            .slice(0, 10),
          resultDate: currentRow.resultDate
            ? new Date(currentRow.resultDate).toISOString().slice(0, 10)
            : '',
          notes: currentRow.notes || '',
        }
      : {
          patientId: '',
          testName: '',
          category: '',
          status: 'ordered',
          resultValue: '',
          unit: '',
          referenceRange: '',
          orderedDate: new Date().toISOString().slice(0, 10),
          resultDate: '',
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

  const onSubmit = async (values: LabResultForm) => {
    try {
      setIsSubmitting(true)

      const payload = {
        patientId: values.patientId,
        testName: values.testName,
        category: values.category || null,
        status: values.status,
        resultValue: values.resultValue || null,
        unit: values.unit || null,
        referenceRange: values.referenceRange || null,
        orderedDate: new Date(values.orderedDate).toISOString(),
        resultDate: values.resultDate
          ? new Date(values.resultDate).toISOString()
          : null,
        notes: values.notes || null,
      }

      if (isEdit) {
        await apiClient.updateLabResult(currentRow.id, payload)
        toast.success('Lab result updated successfully')
      } else {
        await apiClient.createLabResult(payload)
        toast.success('Lab result created successfully')
      }

      form.reset()
      refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        isEdit ? 'Failed to update lab result' : 'Failed to create lab result'
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
            {isEdit ? 'Edit Lab Result' : 'New Lab Result'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the lab result details here. '
              : 'Order a new lab test here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='lab-result-form'
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
                name='testName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Test Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Complete Blood Count'
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
                        placeholder='e.g. Hematology'
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
                      items={labResultStatuses.map((s) => ({
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
                name='resultValue'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Result</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. 13.5'
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
                name='unit'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. g/dL'
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
                name='referenceRange'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Reference Range
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. 12.0 - 16.0'
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
                name='orderedDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Ordered Date
                    </FormLabel>
                    <FormControl>
                      <Input type='date' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='resultDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Result Date
                    </FormLabel>
                    <FormControl>
                      <Input type='date' className='col-span-4' {...field} />
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
                        className='col-span-4 min-h-[80px]'
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
          <Button type='submit' form='lab-result-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
