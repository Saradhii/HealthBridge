import { Hono } from 'hono';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { patients, appointments, wards, patientStays, users } from '../db/schema';
import { tenantMiddleware } from '../auth';
import type { AppContext } from '../auth/types';

const dashboardRouter = new Hono<AppContext>();

dashboardRouter.use('/*', tenantMiddleware);

// GET /api/dashboard/stats - Get dashboard overview statistics
dashboardRouter.get('/stats', async (c) => {
  const tenantId = c.get('tenantId');

  const allPatients = await db.query.patients.findMany({
    where: eq(patients.tenantId, tenantId),
  });
  const totalPatients = allPatients.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointmentsList = await db.query.appointments.findMany({
    where: and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.appointmentDate, today),
      lte(appointments.appointmentDate, tomorrow)
    ),
  });

  const todayAppointments = {
    total: todayAppointmentsList.length,
    completed: todayAppointmentsList.filter(a => a.status === 'completed').length,
    pending: todayAppointmentsList.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
  };

  const tenantWards = await db.query.wards.findMany({
    where: eq(wards.tenantId, tenantId),
    with: {
      rooms: true,
    },
  });

  const allRooms = tenantWards.flatMap(w => w.rooms);
  const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;
  const bedOccupancy = {
    total: allRooms.length,
    occupied: occupiedRooms,
    percentage: allRooms.length > 0 ? Math.round((occupiedRooms / allRooms.length) * 100) : 0,
  };

  const allStaff = await db.query.users.findMany({
    where: and(
      eq(users.tenantId, tenantId),
      eq(users.isActive, true)
    ),
  });

  const staffOnDuty = {
    total: allStaff.length,
    doctors: allStaff.filter(s => s.specialization != null).length,
    nurses: allStaff.filter(s => s.specialization == null && s.department != null).length,
  };

  return c.json({
    totalPatients,
    todayAppointments,
    bedOccupancy,
    staffOnDuty,
  });
});

// GET /api/dashboard/monthly-stats - Get monthly patient registration data
dashboardRouter.get('/monthly-stats', async (c) => {
  const tenantId = c.get('tenantId');

  // Get patient registrations for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyData = await db
    .select({
      month: sql<string>`to_char(created_at, 'Mon')`,
      monthNum: sql<number>`extract(month from created_at)`,
      year: sql<number>`extract(year from created_at)`,
      count: sql<number>`count(*)`,
    })
    .from(patients)
    .where(
      and(
        eq(patients.tenantId, tenantId),
        gte(patients.createdAt, twelveMonthsAgo)
      )
    )
    .groupBy(
      sql`extract(year from created_at)`,
      sql`extract(month from created_at)`,
      sql`to_char(created_at, 'Mon')`
    )
    .orderBy(
      sql`extract(year from created_at)`,
      sql`extract(month from created_at)`
    );

  // Create array with all 12 months, filling in zeros for months with no data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const chartData = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i + 12) % 12;
    const year = currentYear - (currentMonth - 11 + i < 0 ? 1 : 0);

    const dataPoint = monthlyData.find(
      (d) => Number(d.monthNum) === monthIndex + 1 && Number(d.year) === year
    );

    chartData.push({
      name: months[monthIndex],
      total: dataPoint ? Number(dataPoint.count) : 0,
    });
  }

  return c.json({ data: chartData });
});

// GET /api/dashboard/recent-admissions - Get recent patient admissions
dashboardRouter.get('/recent-admissions', async (c) => {
  const tenantId = c.get('tenantId');

  const recentAdmissions = await db.query.patientStays.findMany({
    where: eq(patientStays.tenantId, tenantId),
    orderBy: [desc(patientStays.checkIn)],
    limit: 5,
    with: {
      patient: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      room: {
        columns: {
          roomNumber: true,
          bedType: true,
        },
        with: {
          ward: {
            columns: {
              name: true,
              department: true,
            },
          },
        },
      },
    },
  });

  const formattedAdmissions = recentAdmissions.map((admission) => ({
    id: admission.id,
    patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
    ward: admission.room.ward.name,
    department: admission.room.ward.department || 'General',
    checkIn: admission.checkIn,
    bedType: admission.room.bedType,
  }));

  return c.json({ admissions: formattedAdmissions });
});

export default dashboardRouter;
