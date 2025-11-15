export type VehicleStatus = 'Available' | 'InUse' | 'Maintenance';

export interface Vehicle {
  id: string;
  licensePlate: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface CreateVehicleDto {
  licensePlate?: string;
  status?: VehicleStatus;
  vehicles?: Array<{ licensePlate: string; status?: VehicleStatus }>;
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  status?: VehicleStatus;
}

export interface ValidationError {
  field?: string;
  message: string;
}

export interface BatchVehicleResult {
  vehicle?: Vehicle;
  error?: ValidationError;
  success: boolean;
  index: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ValidationError;
  // For batch operations
  results?: BatchVehicleResult[];
  successCount?: number;
  failureCount?: number;
  success: boolean;
}

// Export validations
export * from './validations';
