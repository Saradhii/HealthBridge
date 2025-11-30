import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';

const patientsRouter = new Hono();

patientsRouter.use('/*', tenantMiddleware);

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

patientsRouter.get('/', requirePermission('PATIENT', 'READ'), async (c) => {
  try {
    const tenantId = c.get('tenantId');

    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const search = c.req.query('search') || '';
    const genderFilter = c.req.query('gender');
    const bloodGroupFilter = c.req.query('bloodGroup');
    const isActiveFilter = c.req.query('isActive');
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = c.req.query('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    const baseConditions = [eq(patients.tenantId, tenantId)];

    if (search) {
      baseConditions.push(
        or(
          ilike(patients.firstName, `%${search}%`),
          ilike(patients.lastName, `%${search}%`),
          ilike(patients.email, `%${search}%`),
          ilike(patients.phone, `%${search}%`)
        )!
      );
    }

    if (genderFilter) {
      baseConditions.push(eq(patients.gender, genderFilter as any));
    }

    if (bloodGroupFilter) {
      baseConditions.push(eq(patients.bloodGroup, bloodGroupFilter as any));
    }

    if (isActiveFilter !== undefined) {
      baseConditions.push(eq(patients.isActive, isActiveFilter === 'true'));
    }

    const orderFn = sortOrder === 'asc' ? asc : desc;

    const patientsList = await db.query.patients.findMany({
      where: and(...baseConditions),
      orderBy: sortBy === 'firstName'
        ? [orderFn(patients.firstName)]
        : sortBy === 'lastName'
        ? [orderFn(patients.lastName)]
        : sortBy === 'createdAt'
        ? [orderFn(patients.createdAt)]
        : [orderFn(patients.createdAt)],
      limit: limit + 1,
      offset,
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(and(...baseConditions));

    const total = Number(countResult[0]?.count || 0);
    const hasMore = patientsList.length > limit;

    if (hasMore) {
      patientsList.pop();
    }

    return c.json({
      patients: patientsList,
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch patients' }, 500);
  }
});

patientsRouter.get('/:id', requirePermission('PATIENT', 'READ'), async (c) => {
  try {
    const tenantId = c.get('tenantId');
    const patientId = c.req.param('id');

    const patient = await db.query.patients.findFirst({
      where: and(
        eq(patients.id, patientId),
        eq(patients.tenantId, tenantId)
      ),
    });

    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    return c.json({ patient });
  } catch (error) {
    return c.json({ error: 'Failed to fetch patient' }, 500);
  }
});

patientsRouter.post('/', requirePermission('PATIENT', 'CREATE'), async (c) => {
  try {
    const tenantId = c.get('tenantId');
    const body = await c.req.json();
    const data = createPatientSchema.parse(body);

    if (data.email) {
      const existingPatient = await db.query.patients.findFirst({
        where: and(
          eq(patients.email, data.email),
          eq(patients.tenantId, tenantId)
        ),
      });

      if (existingPatient) {
        return c.json({ error: 'Email already exists for this hospital' }, 400);
      }
    }

    const [patient] = await db
      .insert(patients)
      .values({
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        isActive: data.isActive,
      })
      .returning();

    return c.json({ patient }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create patient' }, 500);
  }
});

patientsRouter.put('/:id', requirePermission('PATIENT', 'UPDATE'), async (c) => {
  try {
    const tenantId = c.get('tenantId');
    const patientId = c.req.param('id');
    const body = await c.req.json();
    const data = updatePatientSchema.parse(body);

    const existingPatient = await db.query.patients.findFirst({
      where: and(
        eq(patients.id, patientId),
        eq(patients.tenantId, tenantId)
      ),
    });

    if (!existingPatient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    if (data.email && data.email !== existingPatient.email) {
      const emailExists = await db.query.patients.findFirst({
        where: and(
          eq(patients.email, data.email),
          eq(patients.tenantId, tenantId)
        ),
      });

      if (emailExists) {
        return c.json({ error: 'Email already exists for this hospital' }, 400);
      }
    }

    const [updatedPatient] = await db
      .update(patients)
      .set({
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.emergencyContactName !== undefined && { emergencyContactName: data.emergencyContactName }),
        ...(data.emergencyContactPhone !== undefined && { emergencyContactPhone: data.emergencyContactPhone }),
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.chronicConditions !== undefined && { chronicConditions: data.chronicConditions }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(and(eq(patients.id, patientId), eq(patients.tenantId, tenantId)))
      .returning();

    return c.json({ patient: updatedPatient });
  } catch (error) {
    return c.json({ error: 'Failed to update patient' }, 500);
  }
});

patientsRouter.delete('/:id', requirePermission('PATIENT', 'DELETE'), async (c) => {
  try {
    const tenantId = c.get('tenantId');
    const patientId = c.req.param('id');

    const existingPatient = await db.query.patients.findFirst({
      where: and(
        eq(patients.id, patientId),
        eq(patients.tenantId, tenantId)
      ),
    });

    if (!existingPatient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    await db
      .delete(patients)
      .where(and(eq(patients.id, patientId), eq(patients.tenantId, tenantId)));

    return c.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete patient' }, 500);
  }
});

export default patientsRouter;
