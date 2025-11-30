'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { doctorRole } from '../data/data'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  specialization: z.string().min(1, 'Specialization is required.'),
  department: z.string().min(1, 'Department is required.'),
  shift: z.string().min(1, 'Shift is required.'),
  desc: z.string().optional(),
})

type DoctorInviteForm = z.infer<typeof formSchema>

type DoctorInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorsInviteDialog({
  open,
  onOpenChange,
}: DoctorInviteDialogProps) {
  const form = useForm<DoctorInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      specialization: '',
      department: '',
      shift: '',
      desc: ''
    },
  })

  const onSubmit = (values: DoctorInviteForm) => {
    form.reset()
    console.log('Invited doctor:', { ...values, role: 'doctor' })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <MailPlus /> Invite Doctor
          </DialogTitle>
          <DialogDescription>
            Invite a new doctor to join your team by sending them an email
            invitation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='doctor-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='eg: dr.smith@gmail.com'
                      {...field}
                    />
                  </FormControl>
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
                      placeholder='eg: Cardiology, Pediatrics, etc.'
                      {...field}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      placeholder='eg: Internal Medicine, Surgery, etc.'
                      {...field}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      placeholder='eg: Morning, Afternoon, Night'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='desc'
              render={({ field }) => (
                <FormItem className=''>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      placeholder='Add a personal note to your invitation (optional)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button type='submit' form='doctor-invite-form'>
            Invite <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}