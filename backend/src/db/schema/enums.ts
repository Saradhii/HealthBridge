import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'inactive', 'suspended']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const bloodGroupEnum = pgEnum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const roomStatusEnum = pgEnum('room_status', ['vacant', 'occupied', 'maintenance']);
export const bedTypeEnum = pgEnum('bed_type', ['general', 'icu', 'private', 'semi-private']);
export const prescriptionStatusEnum = pgEnum('prescription_status', ['active', 'completed', 'cancelled']);
export const labResultStatusEnum = pgEnum('lab_result_status', ['ordered', 'in_progress', 'completed', 'cancelled']);
export const procedureStatusEnum = pgEnum('procedure_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);