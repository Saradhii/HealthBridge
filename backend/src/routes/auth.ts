import { Hono } from 'hono';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db';
import { users, tenants, refreshTokens, passwordResetTokens, roles, userRoles } from '../db/schema';
import { hashPassword, verifyPassword } from '../lib/password';
import { generateAccessToken, generateRefreshToken, generateRefreshTokenString, verifyRefreshToken } from '../lib/jwt';
import { addToPasswordHistory, checkPasswordHistory } from '../lib/password-history';
import { getUserPermissions } from '../auth';
import { sendPasswordResetEmail } from '../lib/email';
import {
  registerHospitalSchema,
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../types';
import crypto from 'crypto';

const auth = new Hono();

auth.post('/register-hospital', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = registerHospitalSchema.parse(body);

    const slug = validatedData.slug || validatedData.hospitalName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    if (existingTenant) {
      return c.json({ error: 'Hospital slug already taken' }, 400);
    }

    const [tenant] = await db
      .insert(tenants)
      .values({
        name: validatedData.hospitalName,
        slug,
        status: 'active',
      })
      .returning();

    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.email, validatedData.adminEmail),
        eq(users.tenantId, tenant.id)
      ),
    });

    if (existingUser) {
      return c.json({ error: 'Admin email already exists' }, 400);
    }

    const hashedPassword = await hashPassword(validatedData.adminPassword);

    const [admin] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: validatedData.adminEmail,
        password: hashedPassword,
        name: validatedData.adminName,
        emailVerified: true,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        tenantId: users.tenantId,
      });

    await addToPasswordHistory(admin.id, hashedPassword);

    const hospitalAdminRole = await db.query.roles.findFirst({
      where: and(
        eq(roles.slug, 'hospital_admin'),
        eq(roles.isSystemRole, true)
      ),
    });

    if (!hospitalAdminRole) {
      return c.json({ error: 'System role not found' }, 500);
    }

    await db.insert(userRoles).values({
      userId: admin.id,
      roleId: hospitalAdminRole.id,
    });

    const permissions = await getUserPermissions(admin.id);

    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [refreshTokenRecord] = await db
      .insert(refreshTokens)
      .values({
        userId: admin.id,
        token: refreshTokenString,
        expiresAt,
      })
      .returning();

    const accessToken = generateAccessToken({
      userId: admin.id,
      tenantId: tenant.id,
      roles: ['hospital_admin'],
      permissions,
    });

    generateRefreshToken({
      userId: admin.id,
      tenantId: tenant.id,
      tokenId: refreshTokenRecord.id,
    });

    return c.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      user: { ...admin, roles: ['hospital_admin'] },
      accessToken,
      refreshToken: refreshTokenString,
    }, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
      return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = signupSchema.parse(body);

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.email, validatedData.email),
        eq(users.tenantId, decoded.tenantId)
      ),
    });

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    const role = await db.query.roles.findFirst({
      where: and(
        eq(roles.slug, validatedData.roleSlug),
        eq(roles.isSystemRole, true)
      ),
    });

    if (!role) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const [newUser] = await db
      .insert(users)
      .values({
        tenantId: decoded.tenantId,
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        department: validatedData.department,
        specialization: validatedData.specialization,
        shift: validatedData.shift,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        department: users.department,
        specialization: users.specialization,
        shift: users.shift,
        tenantId: users.tenantId,
      });

    await addToPasswordHistory(newUser.id, hashedPassword);

    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: role.id,
    });

    return c.json({ user: { ...newUser, roles: [validatedData.roleSlug] } }, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!user.isActive) {
      return c.json({ error: 'Account is inactive' }, 403);
    }

    const isValidPassword = await verifyPassword(validatedData.password, user.password);

    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const userRoleRecords = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, user.id),
      with: {
        role: true,
      },
    });

    const roleSlugs = userRoleRecords.map(ur => ur.role.slug);
    const permissions = await getUserPermissions(user.id);

    // Fetch tenant information
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, user.tenantId),
      columns: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!tenant) {
      return c.json({ error: 'Tenant not found' }, 404);
    }

    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [refreshTokenRecord] = await db
      .insert(refreshTokens)
      .values({
        userId: user.id,
        token: refreshTokenString,
        expiresAt,
      })
      .returning();

    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      roles: roleSlugs,
      permissions,
    });

    generateRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      tokenId: refreshTokenRecord.id,
    });

    return c.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        specialization: user.specialization,
        shift: user.shift,
        tenantId: user.tenantId,
        roles: roleSlugs,
        forcePasswordChange: user.forcePasswordChange,
      },
      accessToken,
      refreshToken: refreshTokenString,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/refresh', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = refreshTokenSchema.parse(body);

    const tokenRecord = await db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.token, validatedData.refreshToken),
        isNull(refreshTokens.revokedAt)
      ),
    });

    if (!tokenRecord) {
      return c.json({ error: 'Invalid refresh token' }, 401);
    }

    if (new Date() > tokenRecord.expiresAt) {
      return c.json({ error: 'Refresh token expired' }, 401);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, tokenRecord.userId),
    });

    if (!user || !user.isActive) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }

    const userRoleRecords = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, user.id),
      with: {
        role: true,
      },
    });

    const roleSlugs = userRoleRecords.map(ur => ur.role.slug);
    const permissions = await getUserPermissions(user.id);

    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      roles: roleSlugs,
      permissions,
    });

    return c.json({ accessToken });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/logout', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = refreshTokenSchema.parse(body);

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, validatedData.refreshToken));

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user) {
      return c.json({ message: 'If the email exists, a reset link will be sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return c.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = resetPasswordSchema.parse(body);

    const resetTokenRecord = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, validatedData.token),
        eq(passwordResetTokens.used, false)
      ),
    });

    if (!resetTokenRecord) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      return c.json({ error: 'Reset token expired' }, 400);
    }

    const canUsePassword = await checkPasswordHistory(
      resetTokenRecord.userId,
      validatedData.newPassword
    );

    if (!canUsePassword) {
      return c.json({ error: 'Password was used recently. Please choose a different password' }, 400);
    }

    const hashedPassword = await hashPassword(validatedData.newPassword);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(),
        forcePasswordChange: false,
      })
      .where(eq(users.id, resetTokenRecord.userId));

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetTokenRecord.id));

    await addToPasswordHistory(resetTokenRecord.userId, hashedPassword);

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, resetTokenRecord.userId));

    return c.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/change-password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const body = await c.req.json();
    const validatedData = changePasswordSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const isValidOldPassword = await verifyPassword(validatedData.oldPassword, user.password);

    if (!isValidOldPassword) {
      return c.json({ error: 'Invalid old password' }, 400);
    }

    const canUsePassword = await checkPasswordHistory(user.id, validatedData.newPassword);

    if (!canUsePassword) {
      return c.json({ error: 'Password was used recently. Please choose a different password' }, 400);
    }

    const hashedPassword = await hashPassword(validatedData.newPassword);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(),
        forcePasswordChange: false,
      })
      .where(eq(users.id, user.id));

    await addToPasswordHistory(user.id, hashedPassword);

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, user.id));

    return c.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});


export default auth;
