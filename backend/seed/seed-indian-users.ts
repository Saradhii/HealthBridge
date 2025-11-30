import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users, userRoles, tenants, roles } from './schema';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

// Indian hospital departments
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
  'Dermatology',
  'ENT (Ear, Nose & Throat)',
  'Ophthalmology',
  'Nephrology',
  'Gastroenterology',
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
    'Internal Medicine',
    'Pulmonology',
    'Endocrinology',
    'Dermatology',
    'ENT Surgery',
    'Ophthalmology',
  ],
  nurse: [
    'Critical Care',
    'Emergency Nursing',
    'Pediatric Nursing',
    'Surgical Nursing',
    'Oncology Nursing',
    'ICU Nursing',
    'Operation Theatre',
    'Community Health',
  ],
  pharmacist: [
    'Clinical Pharmacy',
    'Hospital Pharmacy',
    'Oncology Pharmacy',
    'Critical Care Pharmacy',
  ],
};

const shifts = ['Morning', 'Evening', 'Night'];

// Realistic Indian first names (Gender-mixed for diversity)
const maleFirstNames = [
  'Aarav', 'Arjun', 'Aryan', 'Advait', 'Kabir', 'Krishna', 'Rohan', 'Ravi',
  'Vikram', 'Sanjay', 'Rajesh', 'Anil', 'Suresh', 'Pradeep', 'Karthik',
  'Siddharth', 'Ashok', 'Manoj', 'Vinay', 'Harish', 'Amit', 'Rahul',
  'Nikhil', 'Varun', 'Aditya', 'Akash', 'Kunal', 'Pankaj', 'Vivek',
  'Tarun', 'Gaurav', 'Abhishek', 'Ankit', 'Mohit', 'Sumit', 'Naveen',
  'Ramesh', 'Dinesh', 'Prakash', 'Santosh', 'Gopal', 'Vimal', 'Sachin',
];

const femaleFirstNames = [
  'Aadhya', 'Ananya', 'Diya', 'Ishita', 'Kavya', 'Meera', 'Priya', 'Saanvi',
  'Shruti', 'Neha', 'Pooja', 'Anjali', 'Divya', 'Swati', 'Riya', 'Sneha',
  'Pallavi', 'Deepa', 'Sonal', 'Nisha', 'Simran', 'Tanvi', 'Aditi', 'Vidya',
  'Lakshmi', 'Shweta', 'Manisha', 'Archana', 'Rekha', 'Seema', 'Asha',
  'Kavita', 'Sunita', 'Geeta', 'Radha', 'Vandana', 'Kamala', 'Usha',
];

// Common Indian surnames across different regions
const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Rao', 'Gupta', 'Verma',
  'Mehta', 'Desai', 'Joshi', 'Iyer', 'Nair', 'Kulkarni', 'Choudhary',
  'Agarwal', 'Kapoor', 'Malhotra', 'Bose', 'Chatterjee', 'Mukherjee',
  'Banerjee', 'Menon', 'Shetty', 'Pillai', 'Yadav', 'Pandey', 'Mishra',
  'Tiwari', 'Dubey', 'Saxena', 'Khanna', 'Chopra', 'Arora', 'Sethi',
  'Bajaj', 'Goel', 'Singhal', 'Agnihotri', 'Bhatt', 'Trivedi', 'Shah',
  'Gandhi', 'Parekh', 'Modi', 'Thakkar', 'Vyas', 'Dixit', 'Chawla',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedIndianUsers() {
  console.log('🌟 Seeding Indian hospital staff for ALL hospitals...\n');

  // Get ALL tenants (hospitals)
  const allTenants = await db.query.tenants.findMany();
  if (allTenants.length === 0) {
    console.error('❌ No tenants found. Please run hospital registration first.');
    process.exit(1);
  }

  console.log(`Found ${allTenants.length} hospital(s):\n`);
  allTenants.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.slug})`);
  });
  console.log();

  // Get all system roles
  const allRoles = await db.query.roles.findMany({
    where: eq(roles.isSystemRole, true),
  });

  const roleMap = new Map(allRoles.map((role) => [role.slug, role]));

  // Define user distribution by role (total: 150 users)
  const usersByRole = [
    { roleSlug: 'doctor', count: 40 },
    { roleSlug: 'nurse', count: 50 },
    { roleSlug: 'pharmacist', count: 15 },
    { roleSlug: 'receptionist', count: 30 },
    { roleSlug: 'hospital_admin', count: 15 },
  ];

  const password = await bcrypt.hash('password123', 10);
  let globalUserIndex = 0;
  let globalCreatedCount = 0;

  // Seed users for each tenant
  for (const tenant of allTenants) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏥 Seeding users for: ${tenant.name}`);
    console.log(`${'='.repeat(80)}\n`);

    let tenantCreatedCount = 0;

    for (const { roleSlug, count } of usersByRole) {
    const role = roleMap.get(roleSlug);
    if (!role) {
      console.warn(`⚠️  Role ${roleSlug} not found, skipping...`);
      continue;
    }

    console.log(`📋 Creating ${count} ${roleSlug}s...`);

    for (let i = 0; i < count; i++) {
      globalUserIndex++;

      // Mix gender for realistic distribution
      const isMale = Math.random() > 0.5;
      const firstName = isMale
        ? getRandomItem(maleFirstNames)
        : getRandomItem(femaleFirstNames);
      const lastName = getRandomItem(lastNames);
      const name = `${firstName} ${lastName}`;

      // Create email with index to avoid duplicates
      const emailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${globalUserIndex}`;
      const email = `${emailName}@${tenant.slug}.com`;

      let department = getRandomItem(departments);
      let specialization = null;
      let shift = getRandomItem(shifts);

      // Assign department and specialization based on role
      if (roleSlug === 'doctor') {
        specialization = getRandomItem(specializations.doctor);
        // Align department with specialization sometimes
        if (specialization === 'Cardiology') department = 'Cardiology';
        else if (specialization === 'Pediatrics') department = 'Pediatrics';
        else if (specialization === 'Orthopedic Surgery') department = 'Orthopedics';
        else if (specialization === 'Neurosurgery') department = 'Neurology';
        else if (specialization === 'Oncology') department = 'Oncology';
      } else if (roleSlug === 'nurse') {
        specialization = getRandomItem(specializations.nurse);
        // Align with specialization
        if (specialization === 'Critical Care' || specialization === 'ICU Nursing') {
          department = Math.random() > 0.5 ? 'Emergency' : 'Cardiology';
        } else if (specialization === 'Emergency Nursing') {
          department = 'Emergency';
        } else if (specialization === 'Pediatric Nursing') {
          department = 'Pediatrics';
        } else if (specialization === 'Surgical Nursing' || specialization === 'Operation Theatre') {
          department = 'General Surgery';
        } else if (specialization === 'Oncology Nursing') {
          department = 'Oncology';
        }
      } else if (roleSlug === 'pharmacist') {
        specialization = getRandomItem(specializations.pharmacist);
        department = 'Pharmacy';
      } else if (roleSlug === 'receptionist') {
        department = 'Administration';
        specialization = null;
        // Receptionists typically work day shifts
        shift = Math.random() > 0.7 ? 'Evening' : 'Morning';
      } else if (roleSlug === 'hospital_admin') {
        department = 'Administration';
        specialization = null;
        shift = 'Morning'; // Admins typically work morning shift
      }

      // Create user with realistic distribution
      const isActive = Math.random() > 0.15; // 85% active
      const emailVerified = Math.random() > 0.1; // 90% verified

      try {
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
            isActive,
            emailVerified,
            forcePasswordChange: false,
          })
          .returning();

        // Assign role
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId: role.id,
        });

        tenantCreatedCount++;
        globalCreatedCount++;

        // Show progress every 10 users
        if (tenantCreatedCount % 10 === 0) {
          console.log(`   ✓ Created ${tenantCreatedCount} users for this hospital...`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to create user ${name}:`, error);
      }
    }

    console.log(`   ✅ Completed ${roleSlug}s\n`);
  }

    // Per-tenant summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ Completed seeding for: ${tenant.name}`);
    console.log(`📊 Created ${tenantCreatedCount} users in this hospital`);
    console.log(`${'='.repeat(60)}\n`);
  }

  // Global summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎉 GLOBAL SUMMARY - Seeding Complete!`);
  console.log(`${'='.repeat(80)}`);
  console.log(`📊 Total Users Created: ${globalCreatedCount} across ${allTenants.length} hospitals`);
  console.log(`   • Doctors: ${40 * allTenants.length} total (${40} per hospital)`);
  console.log(`   • Nurses: ${50 * allTenants.length} total (${50} per hospital)`);
  console.log(`   • Pharmacists: ${15 * allTenants.length} total (${15} per hospital)`);
  console.log(`   • Receptionists: ${30 * allTenants.length} total (${30} per hospital)`);
  console.log(`   • Hospital Admins: ${15 * allTenants.length} total (${15} per hospital)\n`);

  console.log('🔐 Test credentials:');
  console.log(`   Email: [any user email from the hospitals above]`);
  console.log(`   Password: password123\n`);

  await pool.end();
}

seedIndianUsers().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
