import { db } from '../src/db/utils';
import { users, userRoles, tenants, roles } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const departments = [
  'Emergency',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Radiology',
  'Oncology',
  'General Surgery',
  'Obstetrics & Gynecology',
  'Psychiatry',
];

const specializations = {
  doctor: [
    'General Medicine',
    'Cardiology',
    'Pediatrics',
    'Orthopedic Surgery',
    'Neurosurgery',
    'Oncology',
    'Anesthesiology',
    'Emergency Medicine',
  ],
  nurse: [
    'Critical Care',
    'Emergency Nursing',
    'Pediatric Nursing',
    'Surgical Nursing',
    'Oncology Nursing',
  ],
  pharmacist: ['Clinical Pharmacy', 'Hospital Pharmacy', 'Oncology Pharmacy'],
};

const shifts = ['Morning', 'Evening', 'Night'];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Edward', 'Melissa',
  'Ronald', 'Deborah',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedUsers() {
  console.log('Seeding users...');

  // Get the first tenant (hospital)
  const tenant = await db.query.tenants.findFirst();
  if (!tenant) {
    console.error('No tenant found. Please run hospital registration first.');
    return;
  }

  console.log(`Using tenant: ${tenant.name} (${tenant.id})`);

  // Get all system roles
  const allRoles = await db.query.roles.findMany({
    where: eq(roles.isSystemRole, true),
  });

  const roleMap = new Map(allRoles.map((role) => [role.slug, role]));

  // Define user distribution by role
  const usersByRole = [
    { roleSlug: 'doctor', count: 15 },
    { roleSlug: 'nurse', count: 20 },
    { roleSlug: 'pharmacist', count: 5 },
    { roleSlug: 'receptionist', count: 8 },
    { roleSlug: 'hospital_admin', count: 2 },
  ];

  const password = await bcrypt.hash('password123', 10);
  let userIndex = 0;

  for (const { roleSlug, count } of usersByRole) {
    const role = roleMap.get(roleSlug);
    if (!role) {
      console.warn(`Role ${roleSlug} not found, skipping...`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      userIndex++;
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${userIndex}@${tenant.slug}.com`;

      let department = getRandomItem(departments);
      let specialization = null;
      let shift = getRandomItem(shifts);

      if (roleSlug === 'doctor') {
        specialization = getRandomItem(specializations.doctor);
      } else if (roleSlug === 'nurse') {
        specialization = getRandomItem(specializations.nurse);
      } else if (roleSlug === 'pharmacist') {
        specialization = getRandomItem(specializations.pharmacist);
        department = 'Pharmacy';
      } else if (roleSlug === 'receptionist') {
        department = 'Administration';
        specialization = null;
      } else if (roleSlug === 'hospital_admin') {
        department = 'Administration';
        specialization = null;
        shift = 'Morning'; // Admins typically work morning shift
      }

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          tenantId: tenant.id,
          email,
          password,
          name,
          department,
          specialization,
          shift,
          isActive: Math.random() > 0.1, // 90% active, 10% inactive
          emailVerified: Math.random() > 0.2, // 80% verified
          forcePasswordChange: false,
        })
        .returning();

      // Assign role
      await db.insert(userRoles).values({
        userId: newUser.id,
        roleId: role.id,
      });

    }
  }

  console.log(`✅ Successfully seeded ${userIndex} users!`);
  console.log(`Email: [any user email above]@${tenant.slug}.com`);
}
