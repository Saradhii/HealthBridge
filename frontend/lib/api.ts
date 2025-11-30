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
} from './types';
import { useAuthStore } from './store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<{ accessToken: string }> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeStatus: boolean = false
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
        const error = new Error((data as ApiError).error || 'An error occurred');
        // Attach status code to error for better handling
        (error as any).status = response.status;
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

  private async refreshAccessToken(): Promise<{ accessToken: string }> {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.request<{ accessToken: string }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      // Update the access token in the store
      useAuthStore.getState().setTokens(
        response.accessToken,
        refreshToken,
        useAuthStore.getState().user!
      );

      return response;
    } catch (error) {
      // Refresh failed, clear auth state and logout
      useAuthStore.getState().clearAuth();
      throw error;
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authStore = useAuthStore.getState();
    let { accessToken, refreshToken } = authStore;

    if (!accessToken) {
      throw new Error('No access token found. Please login.');
    }

    try {
      return await this.request<T>(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      // Check if it's a 401 Unauthorized error (token expired/invalid)
      const is401Error = error instanceof Error && (error as any).status === 401;

      if (is401Error) {
        // If we're already refreshing, wait for that to complete
        if (this.isRefreshing && this.refreshPromise) {
          await this.refreshPromise;
          // Retry the request with new token
          const newAccessToken = useAuthStore.getState().accessToken;
          if (newAccessToken) {
            return this.request<T>(endpoint, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
          }
        } else if (!this.isRefreshing && refreshToken) {
          // Start refresh process
          this.isRefreshing = true;
          this.refreshPromise = this.refreshAccessToken();

          try {
            await this.refreshPromise;
            // Retry the request with new token
            const newAccessToken = useAuthStore.getState().accessToken;
            if (newAccessToken) {
              return this.request<T>(endpoint, {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
            }
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }
      }

      // If we get here, either we couldn't refresh or it was a different error
      throw error;
    }
  }

  setAuthToken(token: string) {
    this.request = this.request.bind(this);
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
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.roleSlug) queryParams.append('roleSlug', params.roleSlug);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';

    return this.authenticatedRequest<GetUsersResponse>(endpoint);
  }

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return this.authenticatedRequest<CreateUserResponse>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<{ user: any }> {
    return this.authenticatedRequest<{ user: any }>('/api/users/me');
  }

  async updateCurrentUser(data: {
    name?: string;
    department?: string | null;
    specialization?: string | null;
    shift?: string | null;
  }): Promise<{ user: any }> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    return this.authenticatedRequest<{ user: any }>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteUsers(ids: string[]): Promise<{ message: string; deletedCount: number; errors?: string[] }> {
    const results = await Promise.allSettled(
      ids.map(id => this.deleteUser(id))
    );

    const deleted = results.filter(result => result.status === 'fulfilled');
    const errors = results.filter(result => result.status === 'rejected');

    if (deleted.length === 0) {
      throw new Error('Failed to delete any users');
    }

    return {
      message: `Successfully deleted ${deleted.length} user${deleted.length > 1 ? 's' : ''}`,
      deletedCount: deleted.length,
      errors: errors.length > 0 ? errors.map(e => (e as PromiseRejectedResult).reason.message) : undefined
    };
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
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.gender) queryParams.append('gender', params.gender);
    if (params?.bloodGroup) queryParams.append('bloodGroup', params.bloodGroup);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/patients?${queryString}` : '/api/patients';

    return this.authenticatedRequest<GetPatientsResponse>(endpoint);
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
    const results = await Promise.allSettled(
      ids.map(id => this.deletePatient(id))
    );

    const deleted = results.filter(result => result.status === 'fulfilled');
    const errors = results.filter(result => result.status === 'rejected');

    if (deleted.length === 0) {
      throw new Error('Failed to delete any patients');
    }

    return {
      message: `Successfully deleted ${deleted.length} patient${deleted.length > 1 ? 's' : ''}`,
      deletedCount: deleted.length,
      errors: errors.length > 0 ? errors.map(e => (e as PromiseRejectedResult).reason.message) : undefined
    };
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
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/appointments?${queryString}` : '/api/appointments';

    return this.authenticatedRequest<GetAppointmentsResponse>(endpoint);
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
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.floor) queryParams.append('floor', params.floor);
    if (params?.department) queryParams.append('department', params.department);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/wards?${queryString}` : '/api/wards';

    return this.authenticatedRequest<GetWardsResponse>(endpoint);
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
}

export const apiClient = new ApiClient(API_BASE_URL);
