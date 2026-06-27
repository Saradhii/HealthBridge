import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, or, ilike, desc, asc, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { appointments, patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { getPaginationParams, buildPagination } from '../lib/pagination';

const appointmentsRouter = new Hono<AppContext>();

appointmentsRouter.use('/*', tenantMiddleware);

const appointmentPatientColumns = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
} as const;

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  appointmentDate: z.string().datetime(),
  type: z.string().min(1), // consultation, follow-up, emergency, checkup
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional().nullable(),
});

const updateAppointmentSchema = z.object({
  patientId: z.string().uuid().optional(),
  appointmentDate: z.string().datetime().optional(),
  type: z.string().min(1).optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional().nullable(),
});

// GET /api/appointments - List all appointments with pagination, search, and filtering
appointmentsRouter.get('/', requirePermission('APPOINTMENT', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const params = getPaginationParams(c);
  const search = c.req.query('search') || '';
  const statusFilter = c.req.query('status');
  const typeFilter = c.req.query('type');
  const dateFrom = c.req.query('dateFrom');
  const dateTo = c.req.query('dateTo');
  const sortBy = c.req.query('sortBy') || 'appointmentDate';
  const sortOrder = c.req.query('sortOrder') || 'desc';

  const baseConditions = [eq(appointments.tenantId, tenantId)];

  // Search by patient name
  if (search) {
    const searchPattern = `%${search}%`;
    const patientsToSearch = await db.query.patients.findMany({
      where: and(
        eq(patients.tenantId, tenantId),
        or(
          ilike(patients.firstName, searchPattern),
          ilike(patients.lastName, searchPattern),
          ilike(patients.email, searchPattern),
          ilike(patients.phone, searchPattern)
        )
      ),
      columns: { id: true },
    });

    if (patientsToSearch.length > 0) {
      const patientIds = patientsToSearch.map(p => p.id);
      baseConditions.push(
        sql`${appointments.patientId} = ANY(${patientIds})`
      );
    } else {
      // No patients found, return empty result
      return c.json({
        appointments: [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: 0,
          hasMore: false,
          totalPages: 0,
        },
      });
    }
  }

  if (statusFilter) {
    baseConditions.push(eq(appointments.status, statusFilter as any));
  }

  if (typeFilter) {
    baseConditions.push(eq(appointments.type, typeFilter));
  }

  if (dateFrom) {
    baseConditions.push(gte(appointments.appointmentDate, new Date(dateFrom)));
  }
  if (dateTo) {
    baseConditions.push(lte(appointments.appointmentDate, new Date(dateTo)));
  }

  const orderFn = sortOrder === 'asc' ? asc : desc;

  const appointmentsList = await db.query.appointments.findMany({
    where: and(...baseConditions),
    with: {
      patient: {
        columns: appointmentPatientColumns,
      },
    },
    orderBy: sortBy === 'appointmentDate'
      ? [orderFn(appointments.appointmentDate)]
      : sortBy === 'type'
      ? [orderFn(appointments.type)]
      : sortBy === 'status'
      ? [orderFn(appointments.status)]
      : [orderFn(appointments.createdAt)],
    limit: params.limit + 1,
    offset: params.offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(and(...baseConditions));

  const { data, pagination } = buildPagination(appointmentsList, Number(count), params);

  return c.json({ appointments: data, pagination });
});

// GET /api/appointments/:id - Get single appointment
appointmentsRouter.get('/:id', requirePermission('APPOINTMENT', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const appointmentId = c.req.param('id');

  const appointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, appointmentId),
      eq(appointments.tenantId, tenantId)
    ),
    with: {
      patient: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
          allergies: true,
          chronicConditions: true,
        },
      },
    },
  });

  if (!appointment) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  return c.json({ appointment });
});

// POST /api/appointments - Create new appointment
appointmentsRouter.post('/', requirePermission('APPOINTMENT', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const data = createAppointmentSchema.parse(body);

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

  const [newAppointment] = await db
    .insert(appointments)
    .values({
      tenantId,
      patientId: data.patientId,
      appointmentDate: new Date(data.appointmentDate),
      type: data.type,
      status: data.status || 'scheduled',
      notes: data.notes,
    })
    .returning();

  // Fetch complete appointment with patient details
  const createdAppointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, newAppointment.id),
    with: {
      patient: {
        columns: appointmentPatientColumns,
      },
    },
  });

  return c.json({ appointment: createdAppointment }, 201);
});

// PUT /api/appointments/:id - Update appointment
appointmentsRouter.put('/:id', requirePermission('APPOINTMENT', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const appointmentId = c.req.param('id');
  const body = await c.req.json();
  const data = updateAppointmentSchema.parse(body);

  // Check if appointment exists
  const existingAppointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, appointmentId),
      eq(appointments.tenantId, tenantId)
    ),
  });

  if (!existingAppointment) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  // If updating patient, verify new patient exists and belongs to tenant
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
  if (data.appointmentDate !== undefined) updateData.appointmentDate = new Date(data.appointmentDate);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await db
    .update(appointments)
    .set(updateData)
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.tenantId, tenantId)
      )
    );

  // Fetch updated appointment with patient details
  const updatedAppointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
    with: {
      patient: {
        columns: appointmentPatientColumns,
      },
    },
  });

  return c.json({ appointment: updatedAppointment });
});

// DELETE /api/appointments/:id - Delete appointment
appointmentsRouter.delete('/:id', requirePermission('APPOINTMENT', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const appointmentId = c.req.param('id');

  const appointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, appointmentId),
      eq(appointments.tenantId, tenantId)
    ),
  });

  if (!appointment) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  await db
    .delete(appointments)
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.tenantId, tenantId)
      )
    );

  return c.json({ message: 'Appointment deleted successfully' });
});

export default appointmentsRouter;
