import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { wards, rooms, patientStays, patients } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { getPaginationParams, buildPagination } from '../lib/pagination';
import { serializeRoom } from '../lib/serialize';

const wardsRouter = new Hono<AppContext>();

wardsRouter.use('/*', tenantMiddleware);

// ===== VALIDATION SCHEMAS =====

const createWardSchema = z.object({
  name: z.string().min(1),
  department: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  totalBeds: z.number().int().min(1),
});

const updateWardSchema = z.object({
  name: z.string().min(1).optional(),
  department: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  totalBeds: z.number().int().min(1).optional(),
});

const createRoomSchema = z.object({
  wardId: z.string().uuid(),
  roomNumber: z.string().min(1),
  bedType: z.enum(['general', 'icu', 'private', 'semi-private']),
  status: z.enum(['vacant', 'occupied', 'maintenance']).optional(),
});

const updateRoomSchema = z.object({
  roomNumber: z.string().min(1).optional(),
  bedType: z.enum(['general', 'icu', 'private', 'semi-private']).optional(),
  status: z.enum(['vacant', 'occupied', 'maintenance']).optional(),
});

const assignPatientSchema = z.object({
  patientId: z.string().uuid(),
  checkIn: z.string().datetime(),
  expectedCheckOut: z.string().datetime().optional().nullable(),
});

const dischargePatientSchema = z.object({
  actualCheckOut: z.string().datetime().optional(),
});

// Map a ward (with rooms + active stays) into the frontend response shape.
const serializeWard = (ward: { rooms: any[] } & Record<string, unknown>) => {
  const occupiedBeds = ward.rooms.filter(
    (room) => room.status === 'occupied'
  ).length;
  return {
    ...ward,
    occupiedBeds,
    rooms: ward.rooms.map(serializeRoom),
  };
};

// ===== WARD ENDPOINTS =====

wardsRouter.get('/', requirePermission('WARD', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const params = getPaginationParams(c);
  const search = c.req.query('search') || '';
  const floor = c.req.query('floor');
  const department = c.req.query('department');

  const baseConditions = [eq(wards.tenantId, tenantId)];

  if (search) {
    baseConditions.push(
      or(
        ilike(wards.name, `%${search}%`),
        ilike(wards.department, `%${search}%`),
        ilike(wards.floor, `%${search}%`)
      )!
    );
  }

  if (floor) {
    baseConditions.push(eq(wards.floor, floor));
  }

  if (department) {
    baseConditions.push(eq(wards.department, department));
  }

  // Fetch wards with their rooms and patient stays
  const wardsList = await db.query.wards.findMany({
    where: and(...baseConditions),
    orderBy: [desc(wards.createdAt)],
    limit: params.limit + 1,
    offset: params.offset,
    with: {
      rooms: {
        with: {
          patientStays: {
            where: eq(patientStays.isActive, true),
            with: {
              patient: true,
            },
            limit: 1,
          },
        },
      },
    },
  });

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(wards)
    .where(and(...baseConditions));

  const total = Number(countResult[0]?.count || 0);
  const { data, pagination } = buildPagination(wardsList, total, params);

  return c.json({ wards: data.map(serializeWard), pagination });
});

wardsRouter.get('/:id', requirePermission('WARD', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const wardId = c.req.param('id');

  const ward = await db.query.wards.findFirst({
    where: and(eq(wards.id, wardId), eq(wards.tenantId, tenantId)),
    with: {
      rooms: {
        with: {
          patientStays: {
            where: eq(patientStays.isActive, true),
            with: {
              patient: true,
            },
            limit: 1,
          },
        },
      },
    },
  });

  if (!ward) {
    return c.json({ error: 'Ward not found' }, 404);
  }

  return c.json({ ward: serializeWard(ward) });
});

wardsRouter.post('/', requirePermission('WARD', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const data = createWardSchema.parse(body);

  const [ward] = await db
    .insert(wards)
    .values({
      tenantId,
      name: data.name,
      department: data.department,
      floor: data.floor,
      totalBeds: data.totalBeds,
    })
    .returning();

  return c.json({ ward }, 201);
});

wardsRouter.put('/:id', requirePermission('WARD', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const wardId = c.req.param('id');
  const body = await c.req.json();
  const data = updateWardSchema.parse(body);

  const existingWard = await db.query.wards.findFirst({
    where: and(eq(wards.id, wardId), eq(wards.tenantId, tenantId)),
  });

  if (!existingWard) {
    return c.json({ error: 'Ward not found' }, 404);
  }

  const [updatedWard] = await db
    .update(wards)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.floor !== undefined && { floor: data.floor }),
      ...(data.totalBeds !== undefined && { totalBeds: data.totalBeds }),
      updatedAt: new Date(),
    })
    .where(and(eq(wards.id, wardId), eq(wards.tenantId, tenantId)))
    .returning();

  return c.json({ ward: updatedWard });
});

wardsRouter.delete('/:id', requirePermission('WARD', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const wardId = c.req.param('id');

  const existingWard = await db.query.wards.findFirst({
    where: and(eq(wards.id, wardId), eq(wards.tenantId, tenantId)),
  });

  if (!existingWard) {
    return c.json({ error: 'Ward not found' }, 404);
  }

  await db
    .delete(wards)
    .where(and(eq(wards.id, wardId), eq(wards.tenantId, tenantId)));

  return c.json({ message: 'Ward deleted successfully' });
});

// ===== ROOM ENDPOINTS =====

wardsRouter.post('/rooms', requirePermission('WARD', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const data = createRoomSchema.parse(body);

  // Verify ward belongs to tenant
  const ward = await db.query.wards.findFirst({
    where: and(eq(wards.id, data.wardId), eq(wards.tenantId, tenantId)),
  });

  if (!ward) {
    return c.json({ error: 'Ward not found' }, 404);
  }

  // Check for duplicate room number in ward
  const existingRoom = await db.query.rooms.findFirst({
    where: and(
      eq(rooms.wardId, data.wardId),
      eq(rooms.roomNumber, data.roomNumber)
    ),
  });

  if (existingRoom) {
    return c.json({ error: 'Room number already exists in this ward' }, 400);
  }

  const [room] = await db
    .insert(rooms)
    .values({
      wardId: data.wardId,
      roomNumber: data.roomNumber,
      bedType: data.bedType,
      status: data.status || 'vacant',
    })
    .returning();

  return c.json({ room }, 201);
});

wardsRouter.put('/rooms/:id', requirePermission('WARD', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = c.req.param('id');
  const body = await c.req.json();
  const data = updateRoomSchema.parse(body);

  // Verify room exists and belongs to tenant's ward
  const existingRoom = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      ward: true,
    },
  });

  if (!existingRoom || existingRoom.ward.tenantId !== tenantId) {
    return c.json({ error: 'Room not found' }, 404);
  }

  // Check for duplicate room number if updating
  if (data.roomNumber && data.roomNumber !== existingRoom.roomNumber) {
    const duplicate = await db.query.rooms.findFirst({
      where: and(
        eq(rooms.wardId, existingRoom.wardId),
        eq(rooms.roomNumber, data.roomNumber)
      ),
    });

    if (duplicate) {
      return c.json({ error: 'Room number already exists in this ward' }, 400);
    }
  }

  const [updatedRoom] = await db
    .update(rooms)
    .set({
      ...(data.roomNumber !== undefined && { roomNumber: data.roomNumber }),
      ...(data.bedType !== undefined && { bedType: data.bedType }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, roomId))
    .returning();

  return c.json({ room: updatedRoom });
});

wardsRouter.delete('/rooms/:id', requirePermission('WARD', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = c.req.param('id');

  // Verify room exists and belongs to tenant's ward
  const existingRoom = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      ward: true,
    },
  });

  if (!existingRoom || existingRoom.ward.tenantId !== tenantId) {
    return c.json({ error: 'Room not found' }, 404);
  }

  await db.delete(rooms).where(eq(rooms.id, roomId));

  return c.json({ message: 'Room deleted successfully' });
});

// ===== PATIENT ASSIGNMENT ENDPOINTS =====

wardsRouter.post('/rooms/:id/assign', requirePermission('WARD', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = c.req.param('id');
  const body = await c.req.json();
  const data = assignPatientSchema.parse(body);

  // Verify room exists and belongs to tenant
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      ward: true,
    },
  });

  if (!room || room.ward.tenantId !== tenantId) {
    return c.json({ error: 'Room not found' }, 404);
  }

  // Check if room is vacant
  if (room.status !== 'vacant') {
    return c.json({ error: 'Room is not vacant' }, 400);
  }

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

  // Check if patient already has an active stay
  const existingStay = await db.query.patientStays.findFirst({
    where: and(
      eq(patientStays.patientId, data.patientId),
      eq(patientStays.isActive, true)
    ),
  });

  if (existingStay) {
    return c.json({ error: 'Patient is already assigned to a room' }, 400);
  }

  const [stay] = await db
    .insert(patientStays)
    .values({
      tenantId,
      patientId: data.patientId,
      roomId,
      checkIn: new Date(data.checkIn),
      expectedCheckOut: data.expectedCheckOut
        ? new Date(data.expectedCheckOut)
        : null,
      isActive: true,
    })
    .returning();

  await db
    .update(rooms)
    .set({ status: 'occupied', updatedAt: new Date() })
    .where(eq(rooms.id, roomId));

  // Fetch updated room with patient info
  const updatedRoom = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      patientStays: {
        where: eq(patientStays.isActive, true),
        with: {
          patient: true,
        },
        limit: 1,
      },
    },
  });

  return c.json({ room: serializeRoom(updatedRoom!), stay }, 201);
});

wardsRouter.post('/rooms/:id/discharge', requirePermission('WARD', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = c.req.param('id');
  const body = await c.req.json();
  const data = dischargePatientSchema.parse(body);

  // Verify room exists and belongs to tenant
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      ward: true,
    },
  });

  if (!room || room.ward.tenantId !== tenantId) {
    return c.json({ error: 'Room not found' }, 404);
  }

  // Find active patient stay
  const activeStay = await db.query.patientStays.findFirst({
    where: and(
      eq(patientStays.roomId, roomId),
      eq(patientStays.isActive, true)
    ),
  });

  if (!activeStay) {
    return c.json({ error: 'No active patient in this room' }, 404);
  }

  // Update patient stay and room status
  await db
    .update(patientStays)
    .set({
      actualCheckOut: data.actualCheckOut
        ? new Date(data.actualCheckOut)
        : new Date(),
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(patientStays.id, activeStay.id));

  await db
    .update(rooms)
    .set({ status: 'vacant', updatedAt: new Date() })
    .where(eq(rooms.id, roomId));

  // Fetch updated room
  const updatedRoom = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  });

  return c.json({
    room: serializeRoom(updatedRoom!),
    message: 'Patient discharged successfully',
  });
});

export default wardsRouter;
