#!/usr/bin/env bun

import { closeDbConnection } from '../src/db/utils';
import { seedRoles } from './seed-roles';
import { seedUsers } from './seed-users';
import { seedIndianUsers } from './seed-indian-users';
import { seedPatients } from './seed-patients';
import { seedAppointments } from './seed-appointments';

async function seedAll() {
  console.log('🌱 Starting complete database seeding...\n');

  try {
    // Step 1: Seed roles (must be done first)
    console.log('Step 1/5: Seeding system roles...');
    await seedRoles();
    console.log('✅ System roles seeded successfully\n');

    // Step 2: Seed basic users
    console.log('Step 2/5: Seeding basic users...');
    await seedUsers();
    console.log('✅ Basic users seeded successfully\n');

    // Step 3: Seed Indian users (optional)
    console.log('Step 3/5: Seeding Indian hospital staff...');
    await seedIndianUsers();
    console.log('✅ Indian hospital staff seeded successfully\n');

    // Step 4: Seed patients
    console.log('Step 4/5: Seeding patients...');
    await seedPatients();
    console.log('✅ Patients seeded successfully\n');

    // Step 5: Seed appointments
    console.log('Step 5/5: Seeding appointments...');
    await seedAppointments();
    console.log('✅ Appointments seeded successfully\n');

    console.log('🎉 All seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Email: Use any user email from the seeded data');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await closeDbConnection();
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seedAll()
    .then(() => {
      console.log('\n✅ Database seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedAll };