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
    await seedRoles();
    await seedUsers();
    await seedIndianUsers();
    await seedPatients();
    await seedAppointments();
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