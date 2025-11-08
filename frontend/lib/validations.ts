import { VehicleStatus } from '@/types/vehicle';

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
  totalVehicles: number,
  maintenanceCount: number
): { valid: boolean; error?: string } {
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
      error: `Vehicle cannot be deleted when it is ${status}`,
    };
  }

  return { valid: true };
}
