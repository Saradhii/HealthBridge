import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'inactive', 'suspended']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const bloodGroupEnum = pgEnum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const roomStatusEnum = pgEnum('room_status', ['vacant', 'occupied', 'maintenance']);
export const bedTypeEnum = pgEnum('bed_type', ['general', 'icu', 'private', 'semi-private']);