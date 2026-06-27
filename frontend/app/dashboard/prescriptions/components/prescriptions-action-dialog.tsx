'use client'

import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { prescriptionStatuses } from '../data/data'
import { type Prescription } from '../data/schema'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { usePrescriptions } from './prescriptions-provider'
import type { PatientFromDB } from '@/lib/types'

const itemSchema = z.object({
  name: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  instructions: z.string().optional(),
})

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient is required.'),
  diagnosis: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']),
  issuedDate: z.string().min(1, 'Issued date is required.'),
  items: z.array(itemSchema).min(1, 'At least one medication is required.'),
  notes: z.string().optional(),
})

type PrescriptionForm = z.infer<typeof formSchema>

type PrescriptionActionDialogProps = {
  currentRow?: Prescription
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrescriptionsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: PrescriptionActionDialogProps) {
  const isEdit = !!currentRow
  const { refresh } = usePrescriptions()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<PatientFromDB[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)

  const form = useForm<PrescriptionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          patientId: currentRow.patientId,
          diagnosis: currentRow.diagnosis || '',
          status: currentRow.status,
          issuedDate: new Date(currentRow.issuedDate)
            .toISOString()
            .slice(0, 10),
          items: currentRow.items?.length
            ? currentRow.items.map((item) => ({
                name: item.name,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions || '',
              }))
            : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
          notes: currentRow.notes || '',
        }
      : {
          patientId: '',
          diagnosis: '',
          status: 'active',
          issuedDate: new Date().toISOString().slice(0, 10),
          items: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
          notes: '',
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
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

  const onSubmit = async (values: PrescriptionForm) => {
    try {
      setIsSubmitting(true)

      const issuedDate = new Date(values.issuedDate).toISOString()
      const payload = {
        patientId: values.patientId,
        diagnosis: values.diagnosis || null,
        status: values.status,
        issuedDate,
        items: values.items,
        notes: values.notes || null,
      }

      if (isEdit) {
        await apiClient.updatePrescription(currentRow.id, payload)
        toast.success('Prescription updated successfully')
      } else {
        await apiClient.createPrescription(payload)
        toast.success('Prescription created successfully')
      }

      form.reset()
      refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        isEdit ? 'Failed to update prescription' : 'Failed to create prescription'
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
            {isEdit ? 'Edit Prescription' : 'New Prescription'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the prescription details here. '
              : 'Create a new prescription here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='prescription-form'
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
                name='diagnosis'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Diagnosis
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Hypertension'
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
                name='issuedDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Issued Date
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
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      className='col-span-4'
                      items={prescriptionStatuses.map((s) => ({
                        label: s.label,
                        value: s.value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <div className='space-y-3 rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Medications</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-7'
                    onClick={() =>
                      append({
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        instructions: '',
                      })
                    }
                  >
                    <Plus className='mr-1 h-3.5 w-3.5' />
                    Add
                  </Button>
                </div>

                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className='space-y-2 rounded-md border p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Medication {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 text-destructive'
                          onClick={() => remove(index)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem className='space-y-1'>
                          <FormControl>
                            <Input placeholder='Medication name' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='grid grid-cols-2 gap-2'>
                      <FormField
                        control={form.control}
                        name={`items.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem className='space-y-1'>
                            <FormControl>
                              <Input placeholder='Dosage (e.g. 500mg)' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem className='space-y-1'>
                            <FormControl>
                              <Input
                                placeholder='Frequency (e.g. 2x/day)'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.duration`}
                      render={({ field }) => (
                        <FormItem className='space-y-1'>
                          <FormControl>
                            <Input
                              placeholder='Duration (e.g. 7 days)'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.instructions`}
                      render={({ field }) => (
                        <FormItem className='space-y-1'>
                          <FormControl>
                            <Input
                              placeholder='Instructions (optional)'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                {form.formState.errors.items?.message && (
                  <p className='text-sm font-medium text-destructive'>
                    {form.formState.errors.items.message}
                  </p>
                )}
              </div>

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
          <Button type='submit' form='prescription-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
