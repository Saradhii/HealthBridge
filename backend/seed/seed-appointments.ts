import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { appointments, tenants, patients } from './schema';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const appointmentTypes = [
  'consultation',
  'follow-up',
  'emergency',
  'checkup',
  'vaccination',
  'surgery',
  'therapy',
  'diagnostic',
];

const appointmentStatuses = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const;

const appointmentNotes = [
  'Regular checkup',
  'Follow-up from last visit',
  'Patient complained of chest pain',
  'Routine blood pressure monitoring',
  'Diabetes management consultation',
  'Post-surgery follow-up',
  'Vaccination appointment',
  'Annual physical examination',
  'Allergy testing',
  'Mental health consultation',
  'Cardiac evaluation',
  'Orthopedic consultation for knee pain',
  'Dermatology appointment for skin rash',
  'ENT consultation for hearing issues',
  'Ophthalmology eye examination',
  null,
  null, // Some appointments without notes
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDays: number, endDays: number): Date {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + startDays);
  const end = new Date(now);
  end.setDate(end.getDate() + endDays);

  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(timestamp);
}

async function seed() {
  console.log('🌱 Seeding appointments...');

  try {
    // Get the first tenant
    const allTenants = await db.query.tenants.findMany({ limit: 1 });

    if (allTenants.length === 0) {
      console.error('❌ No tenants found. Please run tenant seed first.');
      process.exit(1);
    }

    const tenant = allTenants[0];
    console.log(`✅ Using tenant: ${tenant.name} (${tenant.id})`);

    // Get all patients for this tenant
    const allPatients = await db.query.patients.findMany({
      where: eq(patients.tenantId, tenant.id),
    });

    if (allPatients.length === 0) {
      console.error('❌ No patients found. Please run patient seed first.');
      process.exit(1);
    }

    console.log(`✅ Found ${allPatients.length} patients`);

    // Delete existing appointments for this tenant
    await db.delete(appointments).where(eq(appointments.tenantId, tenant.id));
    console.log('🗑️  Cleared existing appointments');

    // Generate 50 appointments
    const appointmentsToInsert = [];
    const numAppointments = 50;

    for (let i = 0; i < numAppointments; i++) {
      const patient = getRandomElement(allPatients);

      // Mix of past, present, and future appointments
      let appointmentDate;
      const rand = Math.random();
      if (rand < 0.3) {
        // 30% past appointments (last 60 days)
        appointmentDate = getRandomDate(-60, -1);
      } else if (rand < 0.6) {
        // 30% recent/today appointments
        appointmentDate = getRandomDate(-3, 3);
      } else {
        // 40% future appointments (next 90 days)
        appointmentDate = getRandomDate(1, 90);
      }

      // Status based on date
      let status;
      const isPast = appointmentDate < new Date();
      if (isPast) {
        // Past appointments are mostly completed
        const statusRand = Math.random();
        if (statusRand < 0.7) {
          status = 'completed';
        } else if (statusRand < 0.85) {
          status = 'cancelled';
        } else {
          status = 'no_show';
        }
      } else {
        // Future appointments are mostly scheduled or confirmed
        const statusRand = Math.random();
        if (statusRand < 0.6) {
          status = 'scheduled';
        } else if (statusRand < 0.9) {
          status = 'confirmed';
        } else {
          status = 'cancelled';
        }
      }

      appointmentsToInsert.push({
        tenantId: tenant.id,
        patientId: patient.id,
        appointmentDate,
        type: getRandomElement(appointmentTypes),
        status: status as any,
        notes: getRandomElement(appointmentNotes),
      });
    }

    // Insert all appointments
    await db.insert(appointments).values(appointmentsToInsert);

    console.log(`✅ Successfully seeded ${numAppointments} appointments!`);
    console.log('\nAppointment breakdown:');

    const statusCounts = appointmentsToInsert.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
