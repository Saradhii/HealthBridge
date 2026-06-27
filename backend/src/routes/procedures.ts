import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, ilike, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { procedures, patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { getPaginationParams, buildPagination } from '../lib/pagination';

const proceduresRouter = new Hono<AppContext>();

proceduresRouter.use('/*', tenantMiddleware);

const procedurePatientColumns = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const procedureUserColumns = {
  id: true,
  name: true,
} as const;

const createProcedureSchema = z.object({
  patientId: z.string().uuid(),
  performedById: z.string().uuid().optional(),
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledDate: z.string().datetime(),
  completedDate: z.string().datetime().optional().nullable(),
  outcome: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateProcedureSchema = z.object({
  patientId: z.string().uuid().optional(),
  performedById: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional().nullable(),
  outcome: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET /api/procedures - List procedures with pagination, search, and filtering
proceduresRouter.get('/', requirePermission('PROCEDURE', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const params = getPaginationParams(c);
  const search = c.req.query('search') || '';
  const patientIdFilter = c.req.query('patientId');
  const statusFilter = c.req.query('status');
  const sortOrder = c.req.query('sortOrder') || 'desc';

  const baseConditions = [eq(procedures.tenantId, tenantId)];

  if (search) {
    baseConditions.push(ilike(procedures.name, `%${search}%`));
  }

  if (patientIdFilter) {
    baseConditions.push(eq(procedures.patientId, patientIdFilter));
  }

  if (statusFilter) {
    baseConditions.push(eq(procedures.status, statusFilter as any));
  }

  const orderFn = sortOrder === 'asc' ? asc : desc;

  const proceduresList = await db.query.procedures.findMany({
    where: and(...baseConditions),
    with: {
      patient: { columns: procedurePatientColumns },
      performedBy: { columns: procedureUserColumns },
    },
    orderBy: [orderFn(procedures.scheduledDate)],
    limit: params.limit + 1,
    offset: params.offset,
  });

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(procedures)
    .where(and(...baseConditions));

  const total = Number(countResult[0]?.count || 0);
  const { data, pagination } = buildPagination(proceduresList, total, params);

  return c.json({ procedures: data, pagination });
});

// GET /api/procedures/:id - Get single procedure
proceduresRouter.get('/:id', requirePermission('PROCEDURE', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const procedureId = c.req.param('id');

  const procedure = await db.query.procedures.findFirst({
    where: and(
      eq(procedures.id, procedureId),
      eq(procedures.tenantId, tenantId)
    ),
    with: {
      patient: { columns: procedurePatientColumns },
      performedBy: { columns: procedureUserColumns },
    },
  });

  if (!procedure) {
    return c.json({ error: 'Procedure not found' }, 404);
  }

  return c.json({ procedure });
});

// POST /api/procedures - Create new procedure
proceduresRouter.post('/', requirePermission('PROCEDURE', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const data = createProcedureSchema.parse(body);

  const patient = await db.query.patients.findFirst({
    where: and(
      eq(patients.id, data.patientId),
      eq(patients.tenantId, tenantId)
    ),
  });

  if (!patient) {
    return c.json({ error: 'Patient not found' }, 404);
  }

  const [newProcedure] = await db
    .insert(procedures)
    .values({
      tenantId,
      patientId: data.patientId,
      performedById: data.performedById || userId,
      name: data.name,
      category: data.category,
      status: data.status || 'scheduled',
      scheduledDate: new Date(data.scheduledDate),
      completedDate: data.completedDate ? new Date(data.completedDate) : null,
      outcome: data.outcome,
      notes: data.notes,
    })
    .returning();

  const createdProcedure = await db.query.procedures.findFirst({
    where: eq(procedures.id, newProcedure.id),
    with: {
      patient: { columns: procedurePatientColumns },
      performedBy: { columns: procedureUserColumns },
    },
  });

  return c.json({ procedure: createdProcedure }, 201);
});

// PUT /api/procedures/:id - Update procedure
proceduresRouter.put('/:id', requirePermission('PROCEDURE', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const procedureId = c.req.param('id');
  const body = await c.req.json();
  const data = updateProcedureSchema.parse(body);

  const existingProcedure = await db.query.procedures.findFirst({
    where: and(
      eq(procedures.id, procedureId),
      eq(procedures.tenantId, tenantId)
    ),
  });

  if (!existingProcedure) {
    return c.json({ error: 'Procedure not found' }, 404);
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
  if (data.performedById !== undefined) updateData.performedById = data.performedById;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
  if (data.completedDate !== undefined) updateData.completedDate = data.completedDate ? new Date(data.completedDate) : null;
  if (data.outcome !== undefined) updateData.outcome = data.outcome;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await db
    .update(procedures)
    .set(updateData)
    .where(
      and(
        eq(procedures.id, procedureId),
        eq(procedures.tenantId, tenantId)
      )
    );

  const updatedProcedure = await db.query.procedures.findFirst({
    where: eq(procedures.id, procedureId),
    with: {
      patient: { columns: procedurePatientColumns },
      performedBy: { columns: procedureUserColumns },
    },
  });

  return c.json({ procedure: updatedProcedure });
});

// DELETE /api/procedures/:id - Delete procedure
proceduresRouter.delete('/:id', requirePermission('PROCEDURE', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const procedureId = c.req.param('id');

  const procedure = await db.query.procedures.findFirst({
    where: and(
      eq(procedures.id, procedureId),
      eq(procedures.tenantId, tenantId)
    ),
  });

  if (!procedure) {
    return c.json({ error: 'Procedure not found' }, 404);
  }

  await db
    .delete(procedures)
    .where(
      and(
        eq(procedures.id, procedureId),
        eq(procedures.tenantId, tenantId)
      )
    );

  return c.json({ message: 'Procedure deleted successfully' });
});

export default proceduresRouter;
