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
  appointmentDate: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'vaccination' | 'surgery' | 'therapy' | 'diagnostic';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
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
