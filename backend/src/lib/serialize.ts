// Shared response serializers that keep API output shapes consistent across routes.

type RoleSummary = { id: string; name: string; slug: string };

type UserWithRoles = {
  id: string;
  email: string;
  name: string;
  department: string | null;
  specialization: string | null;
  shift: string | null;
  isActive: boolean;
  emailVerified: boolean;
  forcePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: Array<{ role: RoleSummary }>;
};

// Flatten a user record (with its `userRoles` relation) into the response shape
// the frontend expects, with `roles` as an array of role summaries.
export const serializeUser = (user: UserWithRoles) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  department: user.department,
  specialization: user.specialization,
  shift: user.shift,
  isActive: user.isActive,
  emailVerified: user.emailVerified,
  forcePasswordChange: user.forcePasswordChange,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  roles: user.userRoles.map((ur) => ur.role),
});

type ActiveStay = {
  checkIn: Date;
  expectedCheckOut: Date | null;
  patient: { id: string; firstName: string; lastName: string };
};

type RoomWithStays = Record<string, unknown> & {
  patientStays?: ActiveStay[];
};

// Transform a room record into the response shape with a derived `currentPatient`
// summary, dropping the raw `patientStays` relation.
export const serializeRoom = (room: RoomWithStays) => {
  const { patientStays, ...rest } = room;
  const activeStay = patientStays?.[0];
  return {
    ...rest,
    currentPatient: activeStay
      ? {
          patientId: activeStay.patient.id,
          patientName: `${activeStay.patient.firstName} ${activeStay.patient.lastName}`,
          checkIn: activeStay.checkIn,
          expectedCheckOut: activeStay.expectedCheckOut,
        }
      : null,
  };
};
