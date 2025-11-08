
import { Vehicle, VehicleStatus } from '@/lib/validations';

const API_URL = 'http://localhost:3001/api';

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

  const response = await fetch(`${API_URL}/vehicles?${queryParams}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch vehicles');
  }

  return result.data as Vehicle[];
};

export const createVehicle = async (data: {
  licensePlate: string;
  status: VehicleStatus;
}) => {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to create vehicle');
  }

  return result.data as Vehicle;
};

export const updateVehicle = async (
  id: string,
  data: {
    licensePlate: string;
    status: VehicleStatus;
  }
) => {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to update vehicle');
  }

  return result.data as Vehicle;
};

export const deleteVehicle = async (id: string) => {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to delete vehicle');
  }
};
