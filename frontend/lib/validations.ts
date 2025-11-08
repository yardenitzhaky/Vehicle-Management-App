import { Vehicle, VehicleStatus } from '@shared/index';

/**
 * Client-side validation for license plate format
 * Format: XXX-NNN where X is capital letter and N is number
 */
export function validateLicensePlate(licensePlate: string): {
  valid: boolean;
  error?: string;
} {
  if (!licensePlate || licensePlate.trim().length === 0) {
    return {
      valid: false,
      error: 'License plate is required',
    };
  }

  // Validate format: XXX-NNN (3 capital letters, dash, 3 numbers)
  const licensePlateRegex = /^[A-Z]{3}-[0-9]{3}$/;
  if (!licensePlateRegex.test(licensePlate)) {
    return {
      valid: false,
      error: 'License plate must be in format XXX-NNN (3 capital letters, dash, 3 numbers)',
    };
  }

  return { valid: true };
}

/**
 * Client-side validation for status transitions
 * Rule: A vehicle in Maintenance can ONLY transition to Available (not to InUse)
 */
export function canTransitionStatus(
  currentStatus: VehicleStatus,
  newStatus: VehicleStatus
): { valid: boolean; error?: string } {
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  // Maintenance can only go to Available
  if (currentStatus === 'Maintenance' && newStatus !== 'Available') {
    return {
      valid: false,
      error: 'A vehicle in Maintenance can only be set to Available',
    };
  }

  return { valid: true };
}


/**
 * Client-side validation for adding a vehicle to Maintenance
 * Rule: Max 5% of total fleet can be in Maintenance simultaneously
 */
export function canSetToMaintenance(
  vehicles: Vehicle[],
  vehicleId?: string
): { valid: boolean; error?: string } {
  const totalVehicles = vehicles.length;
  const maintenanceCount = vehicles.filter(
    (v) => v.status === 'Maintenance' && v.id !== vehicleId
  ).length;

  const maxMaintenance = Math.floor(totalVehicles * 0.05);

  if (maintenanceCount >= maxMaintenance) {
    return {
      valid: false,
      error: `Cannot set to Maintenance. Max ${maxMaintenance} vehicles (${(
        0.05 * 100
      ).toFixed(0)}% of fleet) allowed in Maintenance.`,
    };
  }

  return { valid: true };
}

/**
 * Client-side validation for deleting a vehicle
 * Rule: Vehicles with status InUse or Maintenance CANNOT be deleted
 */
export function canDeleteVehicle(status: VehicleStatus): {
  valid: boolean;
  error?: string;
} {
  if (status === 'InUse' || status === 'Maintenance') {
    return {
      valid: false,
      error: `Cannot delete vehicle when it is ${status}`,
    };
  }

  return { valid: true };
}

/**
 * Client-side validation for license plate uniqueness
 */
export function isLicensePlateUnique(
  licensePlate: string,
  vehicles: Vehicle[],
  vehicleId?: string
): { valid: boolean; error?: string } {
  const plateExists = vehicles.some(
    (v) =>
      v.licensePlate.toLowerCase() === licensePlate.toLowerCase() &&
      v.id !== vehicleId
  );

  if (plateExists) {
    return {
      valid: false,
      error: 'License plate already exists',
    };
  }

  return { valid: true };
}

/**
 * Comprehensive validation for creating a new vehicle
 */
export function validateCreateVehicle(
  licensePlate: string,
  status: VehicleStatus,
  vehicles: Vehicle[]
): { field: 'licensePlate' | 'status'; message: string } | null {
  const licensePlateValidation = validateLicensePlate(licensePlate);
  if (!licensePlateValidation.valid) {
    return {
      field: 'licensePlate',
      message: licensePlateValidation.error!,
    };
  }

  const uniquenessValidation = isLicensePlateUnique(licensePlate, vehicles);
  if (!uniquenessValidation.valid) {
    return {
      field: 'licensePlate',
      message: uniquenessValidation.error!,
    };
  }

  if (status === 'Maintenance') {
    const maintenanceValidation = canSetToMaintenance(vehicles);
    if (!maintenanceValidation.valid) {
      return {
        field: 'status',
        message: maintenanceValidation.error!,
      };
    }
  }

  return null;
}

/**
 * Comprehensive validation for updating an existing vehicle
 */
export function validateUpdateVehicle(
  vehicleId: string,
  currentVehicle: Vehicle,
  updates: Partial<Vehicle>,
  vehicles: Vehicle[]
): { field: 'licensePlate' | 'status'; message: string } | null {
  if (updates.licensePlate) {
    const licensePlateValidation = validateLicensePlate(updates.licensePlate);
    if (!licensePlateValidation.valid) {
      return {
        field: 'licensePlate',
        message: licensePlateValidation.error!,
      };
    }

    const uniquenessValidation = isLicensePlateUnique(
      updates.licensePlate,
      vehicles,
      vehicleId
    );
    if (!uniquenessValidation.valid) {
      return {
        field: 'licensePlate',
        message: uniquenessValidation.error!,
      };
    }
  }

  if (updates.status) {
    const transitionValidation = canTransitionStatus(
      currentVehicle.status,
      updates.status
    );
if (!transitionValidation.valid) {
      return {
        field: 'status',
        message: transitionValidation.error!,
      };
    }

    if (updates.status === 'Maintenance') {
      const maintenanceValidation = canSetToMaintenance(vehicles, vehicleId);
      if (!maintenanceValidation.valid) {
        return {
          field: 'status',
          message: maintenanceValidation.error!,
        };
      }
    }
  }

  return null;
}