import { Hono } from 'hono';
import { eq, and, gte, lte, sql, desc, inArray } from 'drizzle-orm';
import { db } from '../db';
import { patients, appointments, rooms, wards, patientStays, users } from '../db/schema';
import { tenantMiddleware } from '../auth';

const dashboardRouter = new Hono();

dashboardRouter.use('/*', tenantMiddleware);

// GET /api/dashboard/stats - Get dashboard overview statistics
dashboardRouter.get('/stats', async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;
    console.log('Dashboard stats request for tenantId:', tenantId);

    // Test 1: Get all patients for this tenant
    console.log('TEST 1: Fetching patients...');
    const allPatients = await db.query.patients.findMany({
      where: eq(patients.tenantId, tenantId),
    });
    const totalPatients = allPatients.length;
    console.log('✓ TEST 1 SUCCESS: Total patients:', totalPatients);

    // Test 2: Get today's appointments
    console.log('TEST 2: Fetching appointments...');
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
    console.log('✓ TEST 2 SUCCESS: Today appointments:', todayAppointments);

    // Test 3: Get wards and rooms for bed occupancy
    console.log('TEST 3: Fetching wards...');
    const tenantWards = await db.query.wards.findMany({
      where: eq(wards.tenantId, tenantId),
      with: {
        rooms: true,
      },
    });
    console.log('Wards found:', tenantWards.length);

    const allRooms = tenantWards.flatMap(w => w.rooms);
    const bedOccupancy = {
      total: allRooms.length,
      occupied: allRooms.filter(r => r.status === 'occupied').length,
      percentage: allRooms.length > 0 ? Math.round((allRooms.filter(r => r.status === 'occupied').length / allRooms.length) * 100) : 0,
    };
    console.log('✓ TEST 3 SUCCESS: Bed occupancy:', bedOccupancy);

    // Test 4: Get active staff
    console.log('TEST 4: Fetching staff...');
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
    console.log('✓ TEST 4 SUCCESS: Staff on duty:', staffOnDuty);

    // Return complete response - all tests passed!
    console.log('ALL TESTS PASSED! Sending complete dashboard stats');
    return c.json({
      totalPatients,
      todayAppointments,
      bedOccupancy,
      staffOnDuty,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to fetch dashboard statistics' }, 500);
  }
});

// GET /api/dashboard/monthly-stats - Get monthly patient registration data
dashboardRouter.get('/monthly-stats', async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;

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
  } catch (error) {
    console.error('Monthly stats error:', error);
    return c.json({ error: 'Failed to fetch monthly statistics' }, 500);
  }
});

// GET /api/dashboard/recent-admissions - Get recent patient admissions
dashboardRouter.get('/recent-admissions', async (c) => {
  try {
    const tenantId = c.get('tenantId') as string;

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
  } catch (error) {
    console.error('Recent admissions error:', error);
    return c.json({ error: 'Failed to fetch recent admissions' }, 500);
  }
});

export default dashboardRouter;
