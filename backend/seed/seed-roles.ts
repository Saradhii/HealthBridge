import { db } from '../src/db/utils';
import { roles } from './schema';

const systemRoles = [
  {
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Platform administrator with all system operations',
    permissions: ['*:*'],
    isSystemRole: true,
    hierarchyLevel: 100,
    tenantId: null,
  },
  {
    name: 'Hospital Admin',
    slug: 'hospital_admin',
    description: 'Hospital administrator for tenant configuration and user management',
    permissions: [
      'USER:CREATE', 'USER:READ', 'USER:UPDATE', 'USER:DELETE',
      'ROLE:CREATE', 'ROLE:READ', 'ROLE:UPDATE', 'ROLE:DELETE',
      'PATIENT:CREATE', 'PATIENT:READ', 'PATIENT:UPDATE', 'PATIENT:DELETE',
      'APPOINTMENT:CREATE', 'APPOINTMENT:READ', 'APPOINTMENT:UPDATE', 'APPOINTMENT:DELETE',
      'WARD:CREATE', 'WARD:READ', 'WARD:UPDATE', 'WARD:DELETE',
    ],
    isSystemRole: true,
    hierarchyLevel: 80,
    tenantId: null,
  },
  {
    name: 'Doctor',
    slug: 'doctor',
    description: 'Medical practitioner with patient management',
    permissions: [
      'PATIENT:CREATE', 'PATIENT:READ', 'PATIENT:UPDATE',
      'APPOINTMENT:CREATE', 'APPOINTMENT:READ', 'APPOINTMENT:UPDATE',
      'WARD:READ',
    ],
    isSystemRole: true,
    hierarchyLevel: 60,
    tenantId: null,
  },
  {
    name: 'Nurse',
    slug: 'nurse',
    description: 'Nursing staff for patient care and ward management',
    permissions: [
      'PATIENT:READ', 'PATIENT:UPDATE',
      'APPOINTMENT:READ',
      'WARD:READ', 'WARD:UPDATE',
    ],
    isSystemRole: true,
    hierarchyLevel: 50,
    tenantId: null,
  },
  {
    name: 'Pharmacist',
    slug: 'pharmacist',
    description: 'Pharmacy staff with patient information access',
    permissions: [
      'PATIENT:READ',
    ],
    isSystemRole: true,
    hierarchyLevel: 40,
    tenantId: null,
  },
  {
    name: 'Receptionist',
    slug: 'receptionist',
    description: 'Front desk staff for patient registration and appointments',
    permissions: [
      'PATIENT:CREATE', 'PATIENT:READ', 'PATIENT:UPDATE',
      'APPOINTMENT:CREATE', 'APPOINTMENT:READ', 'APPOINTMENT:UPDATE', 'APPOINTMENT:DELETE',
      'WARD:READ',
    ],
    isSystemRole: true,
    hierarchyLevel: 30,
    tenantId: null,
  },
];

export async function seedRoles() {
  console.log('Seeding system roles...');

  for (const role of systemRoles) {
    await db.insert(roles).values(role);
  }

  console.log('✅ System roles seeded successfully!');
}
