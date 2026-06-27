export interface User {
  id: string;
  email: string;
  name: string;
  department?: string;
  specialization?: string;
  shift?: string;
  tenantId: string;
  roles: string[];
  forcePasswordChange: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  department: string | null;
  specialization: string | null;
  shift: string | null;
  tenantId?: string;
  forcePasswordChange: boolean;
  roles: Array<{ id?: string; name: string; slug: string }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterHospitalRequest {
  hospitalName: string;
  slug?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tenant?: Tenant;
}

export interface RegisterHospitalResponse {
  tenant: Tenant;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterHospitalRequest) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<string>;
  setTokens: (accessToken: string, refreshToken: string, user: User, tenant?: Tenant) => void;
  hydrate: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export interface Role {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  hierarchyLevel: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  users?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface CreateRoleRequest {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  hierarchyLevel?: number;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  hierarchyLevel?: number;
}

export interface GetRolesResponse {
  roles: Role[];
}

export interface GetRoleDetailsResponse {
  role: Role;
}

export interface GetPermissionsResponse {
  permissions: Permission[];
}

// User Management Types
export interface UserFromDB {
  id: string;
  email: string;
  name: string;
  department: string | null;
  specialization: string | null;
  shift: string | null;
  isActive: boolean;
  emailVerified: boolean;
  forcePasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface GetUsersResponse {
  users: UserFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  email: string;
  name: string;
  department?: string | null;
  specialization?: string | null;
  shift?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
  forcePasswordChange?: boolean;
  roleIds: string[];
}

export interface CreateUserResponse {
  user: UserFromDB;
  tempPassword: string;
}

export interface PatientFromDB {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetPatientsResponse {
  patients: PatientFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  isActive?: boolean;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  isActive?: boolean;
}

export interface CreatePatientResponse {
  patient: PatientFromDB;
}

export interface UpdatePatientResponse {
  patient: PatientFromDB;
}

export interface GetPatientResponse {
  patient: PatientFromDB;
}

// Appointment Management Types
export interface AppointmentFromDB {
  id: string;
  tenantId: string;
  patientId: string;
  // ISO date strings over the wire; callers convert to Date as needed.
  appointmentDate: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'vaccination' | 'surgery' | 'therapy' | 'diagnostic';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
    allergies?: string | null;
    chronicConditions?: string | null;
  };
}

export interface GetAppointmentsResponse {
  appointments: AppointmentFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreateAppointmentRequest {
  patientId: string;
  appointmentDate: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'vaccination' | 'surgery' | 'therapy' | 'diagnostic';
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string | null;
}

export interface UpdateAppointmentRequest {
  patientId?: string;
  appointmentDate?: string;
  type?: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'vaccination' | 'surgery' | 'therapy' | 'diagnostic';
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string | null;
}

export interface CreateAppointmentResponse {
  appointment: AppointmentFromDB;
}

export interface UpdateAppointmentResponse {
  appointment: AppointmentFromDB;
}

export interface GetAppointmentResponse {
  appointment: AppointmentFromDB;
}

// Prescription Management Types
export interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionFromDB {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string | null;
  items: PrescriptionItem[];
  notes: string | null;
  status: 'active' | 'completed' | 'cancelled';
  // ISO date strings over the wire; callers convert to Date as needed.
  issuedDate: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

export interface GetPrescriptionsResponse {
  prescriptions: PrescriptionFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreatePrescriptionRequest {
  patientId: string;
  doctorId?: string;
  diagnosis?: string | null;
  items: PrescriptionItem[];
  notes?: string | null;
  status?: 'active' | 'completed' | 'cancelled';
  issuedDate?: string;
}

export interface UpdatePrescriptionRequest {
  patientId?: string;
  doctorId?: string;
  diagnosis?: string | null;
  items?: PrescriptionItem[];
  notes?: string | null;
  status?: 'active' | 'completed' | 'cancelled';
  issuedDate?: string;
}

export interface CreatePrescriptionResponse {
  prescription: PrescriptionFromDB;
}

export interface UpdatePrescriptionResponse {
  prescription: PrescriptionFromDB;
}

export interface GetPrescriptionResponse {
  prescription: PrescriptionFromDB;
}

// Lab Result Management Types
export interface LabResultFromDB {
  id: string;
  tenantId: string;
  patientId: string;
  orderedById: string;
  testName: string;
  category: string | null;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  resultValue: string | null;
  unit: string | null;
  referenceRange: string | null;
  notes: string | null;
  // ISO date strings over the wire; callers convert to Date as needed.
  orderedDate: string;
  resultDate: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  orderedBy: {
    id: string;
    name: string;
  };
}

export interface GetLabResultsResponse {
  labResults: LabResultFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreateLabResultRequest {
  patientId: string;
  orderedById?: string;
  testName: string;
  category?: string | null;
  status?: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  resultValue?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  notes?: string | null;
  orderedDate?: string;
  resultDate?: string | null;
}

export interface UpdateLabResultRequest {
  patientId?: string;
  orderedById?: string;
  testName?: string;
  category?: string | null;
  status?: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  resultValue?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  notes?: string | null;
  orderedDate?: string;
  resultDate?: string | null;
}

export interface CreateLabResultResponse {
  labResult: LabResultFromDB;
}

export interface UpdateLabResultResponse {
  labResult: LabResultFromDB;
}

export interface GetLabResultResponse {
  labResult: LabResultFromDB;
}

// Procedure Management Types
export interface ProcedureFromDB {
  id: string;
  tenantId: string;
  patientId: string;
  performedById: string;
  name: string;
  category: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  // ISO date strings over the wire; callers convert to Date as needed.
  scheduledDate: string;
  completedDate: string | null;
  outcome: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  performedBy: {
    id: string;
    name: string;
  };
}

export interface GetProceduresResponse {
  procedures: ProcedureFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreateProcedureRequest {
  patientId: string;
  performedById?: string;
  name: string;
  category?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string | null;
  outcome?: string | null;
  notes?: string | null;
}

export interface UpdateProcedureRequest {
  patientId?: string;
  performedById?: string;
  name?: string;
  category?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  completedDate?: string | null;
  outcome?: string | null;
  notes?: string | null;
}

export interface CreateProcedureResponse {
  procedure: ProcedureFromDB;
}

export interface UpdateProcedureResponse {
  procedure: ProcedureFromDB;
}

export interface GetProcedureResponse {
  procedure: ProcedureFromDB;
}

// ===== WARDS & ROOMS =====

export type RoomStatus = 'vacant' | 'occupied' | 'maintenance';
export type BedType = 'general' | 'icu' | 'private' | 'semi-private';

export interface CurrentPatient {
  patientId: string;
  patientName: string;
  checkIn: string;
  expectedCheckOut: string | null;
}

export interface RoomFromDB {
  id: string;
  wardId: string;
  roomNumber: string;
  bedType: BedType;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  currentPatient: CurrentPatient | null;
}

export interface WardFromDB {
  id: string;
  tenantId: string;
  name: string;
  department: string | null;
  floor: string | null;
  totalBeds: number;
  createdAt: string;
  updatedAt: string;
  rooms: RoomFromDB[];
  occupiedBeds: number;
}

export interface GetWardsResponse {
  wards: WardFromDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export interface CreateWardRequest {
  name: string;
  department?: string | null;
  floor?: string | null;
  totalBeds: number;
}

export interface UpdateWardRequest {
  name?: string;
  department?: string | null;
  floor?: string | null;
  totalBeds?: number;
}

export interface CreateWardResponse {
  ward: WardFromDB;
}

export interface UpdateWardResponse {
  ward: WardFromDB;
}

export interface GetWardResponse {
  ward: WardFromDB;
}

export interface CreateRoomRequest {
  wardId: string;
  roomNumber: string;
  bedType: BedType;
  status?: RoomStatus;
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  bedType?: BedType;
  status?: RoomStatus;
}

export interface CreateRoomResponse {
  room: RoomFromDB;
}

export interface UpdateRoomResponse {
  room: RoomFromDB;
}

export interface GetRoomResponse {
  room: RoomFromDB;
}

export interface AssignPatientRequest {
  patientId: string;
  checkIn: string;
  expectedCheckOut?: string | null;
}

export interface DischargePatientRequest {
  actualCheckOut?: string;
}

export interface AssignPatientResponse {
  patientStay: {
    id: string;
    roomId: string;
    patientId: string;
    checkIn: string;
    expectedCheckOut: string | null;
  };
  room: RoomFromDB;
}

export interface DischargePatientResponse {
  message: string;
  room: RoomFromDB;
}

// Dashboard Types
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: {
    total: number;
    completed: number;
    pending: number;
  };
  bedOccupancy: {
    total: number;
    occupied: number;
    percentage: number;
  };
  staffOnDuty: {
    total: number;
    doctors: number;
    nurses: number;
  };
}

export interface MonthlyStatsData {
  name: string;
  total: number;
}

export interface MonthlyStatsResponse {
  data: MonthlyStatsData[];
}

export interface RecentAdmission {
  id: string;
  patientName: string;
  ward: string;
  department: string;
  checkIn: string;
  bedType: string;
}

export interface RecentAdmissionsResponse {
  admissions: RecentAdmission[];
}
