import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, or, ilike, desc, asc, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { appointments, patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';

const appointmentsRouter = new Hono();

appointmentsRouter.use('/*', tenantMiddleware);

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
  try {
    const tenantId = c.get('tenantId') as string;

    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const search = c.req.query('search') || '';
    const statusFilter = c.req.query('status');
    const typeFilter = c.req.query('type');
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');
    const sortBy = c.req.query('sortBy') || 'appointmentDate';
    const sortOrder = c.req.query('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

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
            page,
            limit,
            total: 0,
            hasMore: false,
            totalPages: 0,
          },
        });
      }
    }

    // Filter by status
    if (statusFilter) {
      baseConditions.push(eq(appointments.status, statusFilter as any));
    }

    // Filter by type
    if (typeFilter) {
      baseConditions.push(eq(appointments.type, typeFilter));
    }

    // Filter by date range
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
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
      orderBy: sortBy === 'appointmentDate'
        ? [orderFn(appointments.appointmentDate)]
        : sortBy === 'type'
        ? [orderFn(appointments.type)]
        : sortBy === 'status'
        ? [orderFn(appointments.status)]
        : [orderFn(appointments.createdAt)],
      limit: limit + 1,
      offset,
    });

    const hasMore = appointmentsList.length > limit;
    const paginatedAppointments = hasMore ? appointmentsList.slice(0, limit) : appointmentsList;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(...baseConditions));

    const totalPages = Math.ceil(Number(count) / limit);

    return c.json({
      appointments: paginatedAppointments,
      pagination: {
        page,
        limit,
        total: Number(count),
        hasMore,
        totalPages,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

// GET /api/appointments/:id - Get single appointment
appointmentsRouter.get('/:id', requirePermission('APPOINTMENT', 'READ'), async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;
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
  } catch (error) {
    return c.json({ error: 'Failed to fetch appointment' }, 500);
  }
});

// POST /api/appointments - Create new appointment
appointmentsRouter.post('/', requirePermission('APPOINTMENT', 'CREATE'), async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;
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
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
    });

    return c.json({ appointment: createdAppointment }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create appointment' }, 500);
  }
});

// PUT /api/appointments/:id - Update appointment
appointmentsRouter.put('/:id', requirePermission('APPOINTMENT', 'UPDATE'), async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;
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

    const updateData: any = {};
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
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
    });

    return c.json({ appointment: updatedAppointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to update appointment' }, 500);
  }
});

// DELETE /api/appointments/:id - Delete appointment
appointmentsRouter.delete('/:id', requirePermission('APPOINTMENT', 'DELETE'), async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;
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
  } catch (error) {
    return c.json({ error: 'Failed to delete appointment' }, 500);
  }
});

export default appointmentsRouter;
