export type VehicleStatus = 'Available' | 'InUse' | 'Maintenance';

export interface Vehicle {
  id: string;
  licensePlate: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface CreateVehicleDto {
  licensePlate: string;
  status?: VehicleStatus;
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  status?: VehicleStatus;
}

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ValidationError;
  success: boolean;
}
