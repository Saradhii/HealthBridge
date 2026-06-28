import { relations } from 'drizzle-orm';
import { tenants, roles, users, userRoles, passwordHistory, refreshTokens, passwordResetTokens, patients, appointments, wards, rooms, patientStays, prescriptions, labResults, procedures } from './tables';

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  roles: many(roles),
  patients: many(patients),
  appointments: many(appointments),
  wards: many(wards),
  patientStays: many(patientStays),
  prescriptions: many(prescriptions),
  labResults: many(labResults),
  procedures: many(procedures),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  userRoles: many(userRoles),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  userRoles: many(userRoles),
  passwordHistory: many(passwordHistory),
  refreshTokens: many(refreshTokens),
  passwordResetTokens: many(passwordResetTokens),
  prescriptions: many(prescriptions),
  labResults: many(labResults),
  procedures: many(procedures),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const passwordHistoryRelations = relations(passwordHistory, ({ one }) => ({
  user: one(users, {
    fields: [passwordHistory.userId],
    references: [users.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patients.tenantId],
    references: [tenants.id],
  }),
  appointments: many(appointments),
  patientStays: many(patientStays),
  prescriptions: many(prescriptions),
  labResults: many(labResults),
  procedures: many(procedures),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
}));

export const wardsRelations = relations(wards, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [wards.tenantId],
    references: [tenants.id],
  }),
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  ward: one(wards, {
    fields: [rooms.wardId],
    references: [wards.id],
  }),
  patientStays: many(patientStays),
}));

export const patientStaysRelations = relations(patientStays, ({ one }) => ({
  tenant: one(tenants, {
    fields: [patientStays.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [patientStays.patientId],
    references: [patients.id],
  }),
  room: one(rooms, {
    fields: [patientStays.roomId],
    references: [rooms.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [prescriptions.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  doctor: one(users, {
    fields: [prescriptions.doctorId],
    references: [users.id],
  }),
}));

export const labResultsRelations = relations(labResults, ({ one }) => ({
  tenant: one(tenants, {
    fields: [labResults.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [labResults.patientId],
    references: [patients.id],
  }),
  orderedBy: one(users, {
    fields: [labResults.orderedById],
    references: [users.id],
  }),
}));

export const proceduresRelations = relations(procedures, ({ one }) => ({
  tenant: one(tenants, {
    fields: [procedures.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [procedures.patientId],
    references: [patients.id],
  }),
  performedBy: one(users, {
    fields: [procedures.performedById],
    references: [users.id],
  }),
}));