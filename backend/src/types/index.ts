import { z } from 'zod';
export * from './context';

export const registerHospitalSchema = z.object({
  hospitalName: z.string().min(2),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/).optional(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  roleSlug: z.string(),
  department: z.string().optional(),
  specialization: z.string().optional(),
  shift: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8),
});

export const createRoleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9_]+$/),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1),
  hierarchyLevel: z.number().min(1).max(79).default(10),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1).optional(),
  hierarchyLevel: z.number().min(1).max(79).optional(),
});

export type RegisterHospitalInput = z.infer<typeof registerHospitalSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
