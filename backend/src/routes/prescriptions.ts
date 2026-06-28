import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, ilike, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { prescriptions, patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { getPaginationParams, buildPagination } from '../lib/pagination';

const prescriptionsRouter = new Hono<AppContext>();

prescriptionsRouter.use('/*', tenantMiddleware);

const prescriptionPatientColumns = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const prescriptionDoctorColumns = {
  id: true,
  name: true,
} as const;

const prescriptionItemSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

const createPrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  diagnosis: z.string().optional().nullable(),
  items: z.array(prescriptionItemSchema).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  issuedDate: z.string().datetime().optional(),
});

const updatePrescriptionSchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  diagnosis: z.string().optional().nullable(),
  items: z.array(prescriptionItemSchema).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  issuedDate: z.string().datetime().optional(),
});

// GET /api/prescriptions - List prescriptions with pagination, search, and filtering
prescriptionsRouter.get('/', requirePermission('PRESCRIPTION', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const params = getPaginationParams(c);
  const search = c.req.query('search') || '';
  const patientIdFilter = c.req.query('patientId');
  const statusFilter = c.req.query('status');
  const sortOrder = c.req.query('sortOrder') || 'desc';

  const baseConditions = [eq(prescriptions.tenantId, tenantId)];

  if (search) {
    baseConditions.push(ilike(prescriptions.diagnosis, `%${search}%`));
  }

  if (patientIdFilter) {
    baseConditions.push(eq(prescriptions.patientId, patientIdFilter));
  }

  if (statusFilter) {
    baseConditions.push(eq(prescriptions.status, statusFilter as any));
  }

  const orderFn = sortOrder === 'asc' ? asc : desc;

  const prescriptionsList = await db.query.prescriptions.findMany({
    where: and(...baseConditions),
    with: {
      patient: { columns: prescriptionPatientColumns },
      doctor: { columns: prescriptionDoctorColumns },
    },
    orderBy: [orderFn(prescriptions.issuedDate)],
    limit: params.limit + 1,
    offset: params.offset,
  });

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(prescriptions)
    .where(and(...baseConditions));

  const total = Number(countResult[0]?.count || 0);
  const { data, pagination } = buildPagination(prescriptionsList, total, params);

  return c.json({ prescriptions: data, pagination });
});

// GET /api/prescriptions/:id - Get single prescription
prescriptionsRouter.get('/:id', requirePermission('PRESCRIPTION', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const prescriptionId = c.req.param('id');

  const prescription = await db.query.prescriptions.findFirst({
    where: and(
      eq(prescriptions.id, prescriptionId),
      eq(prescriptions.tenantId, tenantId)
    ),
    with: {
      patient: { columns: prescriptionPatientColumns },
      doctor: { columns: prescriptionDoctorColumns },
    },
  });

  if (!prescription) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  return c.json({ prescription });
});

// POST /api/prescriptions - Create new prescription
prescriptionsRouter.post('/', requirePermission('PRESCRIPTION', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const data = createPrescriptionSchema.parse(body);

  // Verify patient exists and belongs to tenant
  const patient = await db.query.patients.findFirst({
    where: and(
      eq(patients.id, data.patientId),
      eq(patients.tenantId, tenantId)
    ),
  });

  if (!patient) {
    return c.json({ error: 'Patient not found' }, 404);
  }

  const [newPrescription] = await db
    .insert(prescriptions)
    .values({
      tenantId,
      patientId: data.patientId,
      doctorId: data.doctorId || userId,
      diagnosis: data.diagnosis,
      items: data.items ?? [],
      notes: data.notes,
      status: data.status || 'active',
      ...(data.issuedDate && { issuedDate: new Date(data.issuedDate) }),
    })
    .returning();

  const createdPrescription = await db.query.prescriptions.findFirst({
    where: eq(prescriptions.id, newPrescription.id),
    with: {
      patient: { columns: prescriptionPatientColumns },
      doctor: { columns: prescriptionDoctorColumns },
    },
  });

  return c.json({ prescription: createdPrescription }, 201);
});

// PUT /api/prescriptions/:id - Update prescription
prescriptionsRouter.put('/:id', requirePermission('PRESCRIPTION', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const prescriptionId = c.req.param('id');
  const body = await c.req.json();
  const data = updatePrescriptionSchema.parse(body);

  const existingPrescription = await db.query.prescriptions.findFirst({
    where: and(
      eq(prescriptions.id, prescriptionId),
      eq(prescriptions.tenantId, tenantId)
    ),
  });

  if (!existingPrescription) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  if (data.patientId) {
    const patient = await db.query.patients.findFirst({
      where: and(
        eq(patients.id, data.patientId),
        eq(patients.tenantId, tenantId)
      ),
    });

    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.patientId !== undefined) updateData.patientId = data.patientId;
  if (data.doctorId !== undefined) updateData.doctorId = data.doctorId;
  if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
  if (data.items !== undefined) updateData.items = data.items;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.issuedDate !== undefined) updateData.issuedDate = new Date(data.issuedDate);

  await db
    .update(prescriptions)
    .set(updateData)
    .where(
      and(
        eq(prescriptions.id, prescriptionId),
        eq(prescriptions.tenantId, tenantId)
      )
    );

  const updatedPrescription = await db.query.prescriptions.findFirst({
    where: eq(prescriptions.id, prescriptionId),
    with: {
      patient: { columns: prescriptionPatientColumns },
      doctor: { columns: prescriptionDoctorColumns },
    },
  });

  return c.json({ prescription: updatedPrescription });
});

// DELETE /api/prescriptions/:id - Delete prescription
prescriptionsRouter.delete('/:id', requirePermission('PRESCRIPTION', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const prescriptionId = c.req.param('id');

  const prescription = await db.query.prescriptions.findFirst({
    where: and(
      eq(prescriptions.id, prescriptionId),
      eq(prescriptions.tenantId, tenantId)
    ),
  });

  if (!prescription) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  await db
    .delete(prescriptions)
    .where(
      and(
        eq(prescriptions.id, prescriptionId),
        eq(prescriptions.tenantId, tenantId)
      )
    );

  return c.json({ message: 'Prescription deleted successfully' });
});

export default prescriptionsRouter;
