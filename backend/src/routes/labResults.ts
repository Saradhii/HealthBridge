import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, ilike, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { labResults, patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { getPaginationParams, buildPagination } from '../lib/pagination';

const labResultsRouter = new Hono<AppContext>();

labResultsRouter.use('/*', tenantMiddleware);

const labResultPatientColumns = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const labResultUserColumns = {
  id: true,
  name: true,
} as const;

const createLabResultSchema = z.object({
  patientId: z.string().uuid(),
  orderedById: z.string().uuid().optional(),
  testName: z.string().min(1),
  category: z.string().optional().nullable(),
  status: z.enum(['ordered', 'in_progress', 'completed', 'cancelled']).optional(),
  resultValue: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  referenceRange: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  orderedDate: z.string().datetime().optional(),
  resultDate: z.string().datetime().optional().nullable(),
});

const updateLabResultSchema = z.object({
  patientId: z.string().uuid().optional(),
  orderedById: z.string().uuid().optional(),
  testName: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  status: z.enum(['ordered', 'in_progress', 'completed', 'cancelled']).optional(),
  resultValue: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  referenceRange: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  orderedDate: z.string().datetime().optional(),
  resultDate: z.string().datetime().optional().nullable(),
});

// GET /api/lab-results - List lab results with pagination, search, and filtering
labResultsRouter.get('/', requirePermission('LAB_RESULT', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const params = getPaginationParams(c);
  const search = c.req.query('search') || '';
  const patientIdFilter = c.req.query('patientId');
  const statusFilter = c.req.query('status');
  const sortOrder = c.req.query('sortOrder') || 'desc';

  const baseConditions = [eq(labResults.tenantId, tenantId)];

  if (search) {
    baseConditions.push(ilike(labResults.testName, `%${search}%`));
  }

  if (patientIdFilter) {
    baseConditions.push(eq(labResults.patientId, patientIdFilter));
  }

  if (statusFilter) {
    baseConditions.push(eq(labResults.status, statusFilter as any));
  }

  const orderFn = sortOrder === 'asc' ? asc : desc;

  const labResultsList = await db.query.labResults.findMany({
    where: and(...baseConditions),
    with: {
      patient: { columns: labResultPatientColumns },
      orderedBy: { columns: labResultUserColumns },
    },
    orderBy: [orderFn(labResults.orderedDate)],
    limit: params.limit + 1,
    offset: params.offset,
  });

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(labResults)
    .where(and(...baseConditions));

  const total = Number(countResult[0]?.count || 0);
  const { data, pagination } = buildPagination(labResultsList, total, params);

  return c.json({ labResults: data, pagination });
});

// GET /api/lab-results/:id - Get single lab result
labResultsRouter.get('/:id', requirePermission('LAB_RESULT', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const labResultId = c.req.param('id');

  const labResult = await db.query.labResults.findFirst({
    where: and(
      eq(labResults.id, labResultId),
      eq(labResults.tenantId, tenantId)
    ),
    with: {
      patient: { columns: labResultPatientColumns },
      orderedBy: { columns: labResultUserColumns },
    },
  });

  if (!labResult) {
    return c.json({ error: 'Lab result not found' }, 404);
  }

  return c.json({ labResult });
});

// POST /api/lab-results - Create new lab result
labResultsRouter.post('/', requirePermission('LAB_RESULT', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const data = createLabResultSchema.parse(body);

  const patient = await db.query.patients.findFirst({
    where: and(
      eq(patients.id, data.patientId),
      eq(patients.tenantId, tenantId)
    ),
  });

  if (!patient) {
    return c.json({ error: 'Patient not found' }, 404);
  }

  const [newLabResult] = await db
    .insert(labResults)
    .values({
      tenantId,
      patientId: data.patientId,
      orderedById: data.orderedById || userId,
      testName: data.testName,
      category: data.category,
      status: data.status || 'ordered',
      resultValue: data.resultValue,
      unit: data.unit,
      referenceRange: data.referenceRange,
      notes: data.notes,
      ...(data.orderedDate && { orderedDate: new Date(data.orderedDate) }),
      ...(data.resultDate !== undefined && { resultDate: data.resultDate ? new Date(data.resultDate) : null }),
    })
    .returning();

  const createdLabResult = await db.query.labResults.findFirst({
    where: eq(labResults.id, newLabResult.id),
    with: {
      patient: { columns: labResultPatientColumns },
      orderedBy: { columns: labResultUserColumns },
    },
  });

  return c.json({ labResult: createdLabResult }, 201);
});

// PUT /api/lab-results/:id - Update lab result
labResultsRouter.put('/:id', requirePermission('LAB_RESULT', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const labResultId = c.req.param('id');
  const body = await c.req.json();
  const data = updateLabResultSchema.parse(body);

  const existingLabResult = await db.query.labResults.findFirst({
    where: and(
      eq(labResults.id, labResultId),
      eq(labResults.tenantId, tenantId)
    ),
  });

  if (!existingLabResult) {
    return c.json({ error: 'Lab result not found' }, 404);
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
  if (data.orderedById !== undefined) updateData.orderedById = data.orderedById;
  if (data.testName !== undefined) updateData.testName = data.testName;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.resultValue !== undefined) updateData.resultValue = data.resultValue;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.referenceRange !== undefined) updateData.referenceRange = data.referenceRange;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.orderedDate !== undefined) updateData.orderedDate = new Date(data.orderedDate);
  if (data.resultDate !== undefined) updateData.resultDate = data.resultDate ? new Date(data.resultDate) : null;

  await db
    .update(labResults)
    .set(updateData)
    .where(
      and(
        eq(labResults.id, labResultId),
        eq(labResults.tenantId, tenantId)
      )
    );

  const updatedLabResult = await db.query.labResults.findFirst({
    where: eq(labResults.id, labResultId),
    with: {
      patient: { columns: labResultPatientColumns },
      orderedBy: { columns: labResultUserColumns },
    },
  });

  return c.json({ labResult: updatedLabResult });
});

// DELETE /api/lab-results/:id - Delete lab result
labResultsRouter.delete('/:id', requirePermission('LAB_RESULT', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const labResultId = c.req.param('id');

  const labResult = await db.query.labResults.findFirst({
    where: and(
      eq(labResults.id, labResultId),
      eq(labResults.tenantId, tenantId)
    ),
  });

  if (!labResult) {
    return c.json({ error: 'Lab result not found' }, 404);
  }

  await db
    .delete(labResults)
    .where(
      and(
        eq(labResults.id, labResultId),
        eq(labResults.tenantId, tenantId)
      )
    );

  return c.json({ message: 'Lab result deleted successfully' });
});

export default labResultsRouter;
