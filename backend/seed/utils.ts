import { db } from '../src/db/utils';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Re-export db for seed files
export { db };

// Re-export schema for seed files
export * from '../src/db/schema';

// Shared utility functions for seeding

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function createSystemRoles(roleData: typeof schema.roles[]) {
  console.log('Creating system roles...');
  for (const role of roleData) {
    await db.insert(schema.roles).values(role);
  }
  console.log('✅ System roles created');
}

export async function createUsers(userData: Array<typeof schema.users.$inferInsert & { roleIds: string[] }>) {
  console.log('Creating users...');
  for (const user of userData) {
    const { roleIds, ...userFields } = user;
    const [newUser] = await db.insert(schema.users).values(userFields).returning();

    if (roleIds.length > 0) {
      const roleAssignments = roleIds.map(roleId => ({
        userId: newUser.id,
        roleId,
      }));
      await db.insert(schema.userRoles).values(roleAssignments);
    }
  }
  console.log(`✅ Created ${userData.length} users`);
}

export async function createPatients(patientData: typeof schema.patients.$inferInsert[]) {
  console.log('Creating patients...');
  await db.insert(schema.patients).values(patientData);
  console.log(`✅ Created ${patientData.length} patients`);
}

export async function createAppointments(appointmentData: typeof schema.appointments.$inferInsert[]) {
  console.log('Creating appointments...');
  await db.insert(schema.appointments).values(appointmentData);
  console.log(`✅ Created ${appointmentData.length} appointments`);
}

// Common data arrays for seeding
export const departments = [
  'Emergency', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology',
  'Radiology', 'Oncology', 'General Surgery', 'Obstetrics & Gynecology', 'Psychiatry',
];

export const specializations = {
  doctor: [
    'General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedic Surgery',
    'Neurosurgery', 'Oncology', 'Anesthesiology', 'Emergency Medicine',
  ],
  nurse: [
    'Critical Care', 'Emergency Nursing', 'Pediatric Nursing',
    'Surgical Nursing', 'Oncology Nursing',
  ],
  pharmacist: ['Clinical Pharmacy', 'Hospital Pharmacy', 'Oncology Pharmacy'],
};

export const shifts = ['Morning', 'Evening', 'Night'];

export const appointmentTypes = [
  'consultation', 'follow-up', 'emergency', 'checkup', 'vaccination',
  'surgery', 'therapy', 'diagnostic',
];

export const appointmentStatuses = [
  'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show',
] as const;

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const genders = ['male', 'female', 'other'] as const;