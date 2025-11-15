
import {
  Vehicle,
  VehicleStatus,
  ApiResponse,
  BatchVehicleResult,
} from '@shared/index';

const API_URL = 'http://localhost:3001/api';

/**
 * Generic API request helper with error handling
 */
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Request failed');
  }

  return result.data as T;
}

export const fetchVehicles = async (params: {
  statusFilter: string;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) => {
  const queryParams = new URLSearchParams({
    ...(params.statusFilter !== 'all' && { status: params.statusFilter }),
    ...(params.searchTerm && { search: params.searchTerm }),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  return apiRequest<Vehicle[]>(`${API_URL}/vehicles?${queryParams}`);
};

/**
 * Create one or more vehicles
 * @param data - Single vehicle or array of vehicles to create
 * @returns Single vehicle or batch response with results
 */
export const createVehicles = async (
  data:
    | { licensePlate: string; status: VehicleStatus }
    | Array<{ licensePlate: string; status?: VehicleStatus }>
): Promise<Vehicle | ApiResponse<Vehicle[]>> => {
  // Handle batch creation
  if (Array.isArray(data)) {
    const response = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicles: data }),
    });

    const result = await response.json();
    return result;
  }

  // Handle single vehicle creation
  return apiRequest<Vehicle>(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateVehicle = async (
  id: string,
  data: {
    licensePlate: string;
    status: VehicleStatus;
  }
) => {
  return apiRequest<Vehicle>(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteVehicle = async (id: string) => {
  return apiRequest<void>(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
  });
};
