'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

export default function HelpPage() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
        Help Center
        </h1>
        <p className='text-muted-foreground'>
        Learn how to use the HealthBridge dashboard effectively
        </p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='-mx-1 px-1.5 lg:max-w-xl'>
          <Accordion type='multiple' className='w-full space-y-4'>
        <AccordionItem value='getting-started' className='border rounded-lg px-4'>
          <AccordionTrigger className='text-base font-semibold'>
            Getting Started with HealthBridge
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground space-y-3'>
            <p>
              HealthBridge is your comprehensive hospital management system. The dashboard provides an at-a-glance view of your hospital&apos;s key metrics and activities.
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Monitor real-time statistics including patient count, appointments, and bed occupancy</li>
              <li>Access patient records and manage admissions</li>
              <li>Schedule and track appointments efficiently</li>
              <li>Manage staff roles and permissions</li>
              <li>View analytics and generate reports</li>
            </ul>
            <p>
              Navigate through different sections using the sidebar menu. Each section is designed to help you manage specific aspects of your hospital operations.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='managing-patients' className='border rounded-lg px-4'>
          <AccordionTrigger className='text-base font-semibold'>
            Managing Patients
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground space-y-3'>
            <p>
              The Patients section allows you to manage all patient information efficiently.
            </p>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>To add a new patient:</h4>
              <ol className='list-decimal pl-6 space-y-1'>
                <li>Navigate to the Patients page</li>
                <li>Click the &quot;Add Patient&quot; button</li>
                <li>Fill in the required information including personal details, medical history, and contact information</li>
                <li>Save the patient record</li>
              </ol>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Features available:</h4>
              <ul className='list-disc pl-6 space-y-1'>
                <li>Search and filter patients by name, ID, or status</li>
                <li>View detailed patient profiles with medical history</li>
                <li>Edit patient information as needed</li>
                <li>Export patient data for reports</li>
                <li>Track patient admissions and discharges</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='appointments' className='border rounded-lg px-4'>
          <AccordionTrigger className='text-base font-semibold'>
            Managing Appointments
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground space-y-3'>
            <p>
              Efficiently schedule and manage patient appointments through the Appointments module.
            </p>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Scheduling appointments:</h4>
              <ol className='list-decimal pl-6 space-y-1'>
                <li>Go to the Appointments page</li>
                <li>Click &quot;Schedule New Appointment&quot;</li>
                <li>Select patient, doctor, date, and time slot</li>
                <li>Add appointment notes or special requirements</li>
                <li>Confirm the appointment</li>
              </ol>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Appointment management:</h4>
              <ul className='list-disc pl-6 space-y-1'>
                <li>View daily, weekly, or monthly appointment schedules</li>
                <li>Filter appointments by status (scheduled, completed, cancelled)</li>
                <li>Send automated reminders to patients</li>
                <li>Reschedule or cancel appointments when necessary</li>
                <li>Generate appointment reports for analysis</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='user-management' className='border rounded-lg px-4'>
          <AccordionTrigger className='text-base font-semibold'>
            User Management & Roles
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground space-y-3'>
            <p>
              Manage hospital staff, doctors, and their access permissions through the User Management system.
            </p>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Adding new users:</h4>
              <ol className='list-decimal pl-6 space-y-1'>
                <li>Navigate to Users section</li>
                <li>Click &quot;Invite User&quot; or &quot;Add User&quot;</li>
                <li>Enter user details and email address</li>
                <li>Assign appropriate role and permissions</li>
                <li>Send invitation to set up their account</li>
              </ol>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Role-based access:</h4>
              <ul className='list-disc pl-6 space-y-1'>
                <li><strong>Admin:</strong> Full access to all features and settings</li>
                <li><strong>Doctor:</strong> Manage patients, view appointments, access medical records</li>
                <li><strong>Nurse:</strong> Update patient status, manage daily care tasks</li>
                <li><strong>Receptionist:</strong> Schedule appointments, manage patient registrations</li>
                <li>Customize permissions based on your hospital&apos;s structure</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='analytics' className='border rounded-lg px-4'>
          <AccordionTrigger className='text-base font-semibold'>
            Analytics & Reports
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground space-y-3'>
            <p>
              Monitor hospital performance and make data-driven decisions with comprehensive analytics.
            </p>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Key metrics tracked:</h4>
              <ul className='list-disc pl-6 space-y-1'>
                <li>Patient admission and discharge trends</li>
                <li>Bed occupancy rates</li>
                <li>Staff performance and workload distribution</li>
                <li>Appointment success rates and no-shows</li>
                <li>Revenue and billing analytics</li>
                <li>Department-specific performance metrics</li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium text-foreground'>Generating reports:</h4>
              <ol className='list-decimal pl-6 space-y-1'>
                <li>Select the Analytics tab from the dashboard</li>
                <li>Choose your preferred date range</li>
                <li>Select the type of report you need</li>
                <li>Customize filters if required</li>
                <li>Export data in PDF or Excel format</li>
              </ol>
            </div>
            <p className='text-sm'>
              Tip: Schedule automated weekly or monthly reports to stay informed about your hospital&apos;s performance.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
        </div>
      </div>
    </div>
  )
}