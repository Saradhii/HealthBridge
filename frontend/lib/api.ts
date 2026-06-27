import type {
  LoginRequest,
  LoginResponse,
  RegisterHospitalRequest,
  RegisterHospitalResponse,
  ApiError,
  GetRolesResponse,
  GetRoleDetailsResponse,
  GetPermissionsResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  Role,
  GetUsersResponse,
  CreateUserRequest,
  CreateUserResponse,
  GetPatientsResponse,
  CreatePatientRequest,
  CreatePatientResponse,
  UpdatePatientRequest,
  UpdatePatientResponse,
  GetPatientResponse,
  GetAppointmentsResponse,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  UpdateAppointmentRequest,
  UpdateAppointmentResponse,
  GetAppointmentResponse,
  GetWardsResponse,
  CreateWardRequest,
  CreateWardResponse,
  UpdateWardRequest,
  UpdateWardResponse,
  GetWardResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  UpdateRoomRequest,
  UpdateRoomResponse,
  GetRoomResponse,
  AssignPatientRequest,
  AssignPatientResponse,
  DischargePatientRequest,
  DischargePatientResponse,
  DashboardStats,
  MonthlyStatsResponse,
  RecentAdmissionsResponse,
  CurrentUser,
} from './types';
import { useAuthStore } from './store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type QueryParams = Record<string, string | number | boolean | undefined>;

type StatusError = Error & { status?: number };

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Builds a `?key=value` query string, skipping empty/undefined values. */
  private buildQuery(params?: QueryParams): string {
    if (!params) return '';
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '' || value === 0) continue;
      queryParams.append(key, String(value));
    }
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error: StatusError = new Error(
          (data as ApiError).error || 'An error occurred'
        );
        // Attach status code to error for better handling
        error.status = response.status;
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerHospital(
    data: RegisterHospitalRequest
  ): Promise<RegisterHospitalResponse> {
    return this.request<RegisterHospitalResponse>('/api/auth/register-hospital', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  private requestWithToken<T>(
    endpoint: string,
    options: RequestInit,
    token: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Refreshes the access token, delegating to the single refresh implementation
   * in the auth store. Concurrent callers share one in-flight refresh.
   */
  private refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = useAuthStore
        .getState()
        .refreshAccessToken()
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { accessToken, refreshToken } = useAuthStore.getState();

    if (!accessToken) {
      throw new Error('No access token found. Please login.');
    }

    try {
      return await this.requestWithToken<T>(endpoint, options, accessToken);
    } catch (error) {
      const is401Error =
        error instanceof Error && (error as StatusError).status === 401;

      // Only attempt a single refresh-and-retry on auth failures.
      if (!is401Error || !refreshToken) {
        throw error;
      }

      const newAccessToken = await this.refreshAccessToken();
      return this.requestWithToken<T>(endpoint, options, newAccessToken);
    }
  }

  // Role Management APIs
  async getPermissions(): Promise<GetPermissionsResponse> {
    return this.authenticatedRequest<GetPermissionsResponse>('/api/roles/permissions');
  }

  async getRoles(): Promise<GetRolesResponse> {
    return this.authenticatedRequest<GetRolesResponse>('/api/roles');
  }

  async getRole(id: string): Promise<GetRoleDetailsResponse> {
    return this.authenticatedRequest<GetRoleDetailsResponse>(`/api/roles/${id}`);
  }

  async createRole(data: CreateRoleRequest): Promise<{ role: Role }> {
    return this.authenticatedRequest<{ role: Role }>('/api/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<{ role: Role }> {
    return this.authenticatedRequest<{ role: Role }>(`/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // User Management APIs
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    roleSlug?: string;
  }): Promise<GetUsersResponse> {
    return this.authenticatedRequest<GetUsersResponse>(
      `/api/users${this.buildQuery(params)}`
    );
  }

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return this.authenticatedRequest<CreateUserResponse>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<{ user: CurrentUser }> {
    return this.authenticatedRequest<{ user: CurrentUser }>('/api/users/me');
  }

  async updateCurrentUser(data: {
    name?: string;
    department?: string | null;
    specialization?: string | null;
    shift?: string | null;
  }): Promise<{ user: CurrentUser }> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    return this.authenticatedRequest<{ user: CurrentUser }>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  /** Fans out single-delete calls and aggregates the settled results. */
  private async deleteMany(
    ids: string[],
    deleteOne: (id: string) => Promise<unknown>,
    entityName: string
  ): Promise<{ message: string; deletedCount: number; errors?: string[] }> {
    const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));

    const deleted = results.filter((result) => result.status === 'fulfilled');
    const errors = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (deleted.length === 0) {
      throw new Error(`Failed to delete any ${entityName}s`);
    }

    return {
      message: `Successfully deleted ${deleted.length} ${entityName}${deleted.length > 1 ? 's' : ''}`,
      deletedCount: deleted.length,
      errors:
        errors.length > 0 ? errors.map((e) => e.reason.message) : undefined,
    };
  }

  async deleteUsers(ids: string[]): Promise<{ message: string; deletedCount: number; errors?: string[] }> {
    return this.deleteMany(ids, (id) => this.deleteUser(id), 'user');
  }

  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
    bloodGroup?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetPatientsResponse> {
    return this.authenticatedRequest<GetPatientsResponse>(
      `/api/patients${this.buildQuery(params)}`
    );
  }

  async getPatient(id: string): Promise<GetPatientResponse> {
    return this.authenticatedRequest<GetPatientResponse>(`/api/patients/${id}`);
  }

  async createPatient(data: CreatePatientRequest): Promise<CreatePatientResponse> {
    return this.authenticatedRequest<CreatePatientResponse>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: UpdatePatientRequest): Promise<UpdatePatientResponse> {
    return this.authenticatedRequest<UpdatePatientResponse>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/patients/${id}`, {
      method: 'DELETE',
    });
  }

  async deletePatients(ids: string[]): Promise<{ message: string; deletedCount: number; errors?: string[] }> {
    return this.deleteMany(ids, (id) => this.deletePatient(id), 'patient');
  }

  // Appointment Management APIs
  async getAppointments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetAppointmentsResponse> {
    return this.authenticatedRequest<GetAppointmentsResponse>(
      `/api/appointments${this.buildQuery(params)}`
    );
  }

  async getAppointment(id: string): Promise<GetAppointmentResponse> {
    return this.authenticatedRequest<GetAppointmentResponse>(`/api/appointments/${id}`);
  }

  async createAppointment(data: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    return this.authenticatedRequest<CreateAppointmentResponse>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<UpdateAppointmentResponse> {
    return this.authenticatedRequest<UpdateAppointmentResponse>(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Ward Management APIs
  async getWards(params?: {
    page?: number;
    limit?: number;
    search?: string;
    floor?: string;
    department?: string;
  }): Promise<GetWardsResponse> {
    return this.authenticatedRequest<GetWardsResponse>(
      `/api/wards${this.buildQuery(params)}`
    );
  }

  async getWard(id: string): Promise<GetWardResponse> {
    return this.authenticatedRequest<GetWardResponse>(`/api/wards/${id}`);
  }

  async createWard(data: CreateWardRequest): Promise<CreateWardResponse> {
    return this.authenticatedRequest<CreateWardResponse>('/api/wards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWard(id: string, data: UpdateWardRequest): Promise<UpdateWardResponse> {
    return this.authenticatedRequest<UpdateWardResponse>(`/api/wards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWard(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/wards/${id}`, {
      method: 'DELETE',
    });
  }

  // Room Management APIs
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    return this.authenticatedRequest<CreateRoomResponse>('/api/wards/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoom(id: string): Promise<GetRoomResponse> {
    return this.authenticatedRequest<GetRoomResponse>(`/api/wards/rooms/${id}`);
  }

  async updateRoom(id: string, data: UpdateRoomRequest): Promise<UpdateRoomResponse> {
    return this.authenticatedRequest<UpdateRoomResponse>(`/api/wards/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/wards/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  async assignPatientToRoom(roomId: string, data: AssignPatientRequest): Promise<AssignPatientResponse> {
    return this.authenticatedRequest<AssignPatientResponse>(`/api/wards/rooms/${roomId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dischargePatientFromRoom(roomId: string, data?: DischargePatientRequest): Promise<DischargePatientResponse> {
    return this.authenticatedRequest<DischargePatientResponse>(`/api/wards/rooms/${roomId}/discharge`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    return this.authenticatedRequest<DashboardStats>('/api/dashboard/stats');
  }

  async getMonthlyStats(): Promise<MonthlyStatsResponse> {
    return this.authenticatedRequest<MonthlyStatsResponse>('/api/dashboard/monthly-stats');
  }

  async getRecentAdmissions(): Promise<RecentAdmissionsResponse> {
    return this.authenticatedRequest<RecentAdmissionsResponse>('/api/dashboard/recent-admissions');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
