import { Vehicle, VehicleStatus, ValidationError } from './index';

// Constants
export const MAINTENANCE_LIMIT_PERCENTAGE = 0.05;

/**
 * Validates if a vehicle can be deleted
 * Rule: Vehicles with status InUse or Maintenance CANNOT be deleted
 */
export function canDeleteVehicle(status: VehicleStatus): {
  valid: boolean;
  error?: string;
} {
  if (status === 'InUse' || status === 'Maintenance') {
    return {
      valid: false,
      error: `Cannot delete a vehicle that is ${status}`,
    };
  }

  return { valid: true };
}

/**
 * Validates if adding a vehicle to Maintenance would exceed the 5% limit
 * Rule: Maximum 5% of total fleet can be in Maintenance simultaneously
 */
export function canSetToMaintenance(
  vehicles: Vehicle[],
  currentVehicleId?: string
): { valid: boolean; error?: string } {
  const totalVehicles = vehicles.length;
  const maintenanceCount = vehicles.filter(
    (v) => v.status === 'Maintenance' && v.id !== currentVehicleId
  ).length;

  const maxMaintenance = Math.floor(totalVehicles * MAINTENANCE_LIMIT_PERCENTAGE);

  if (maintenanceCount >= maxMaintenance) {
    return {
      valid: false,
      error: `Cannot exceed 5% maintenance limit (${maintenanceCount} of ${totalVehicles} vehicles already in maintenance, max allowed: ${maxMaintenance})`,
    };
  }

  return { valid: true };
}

/**
 * Validates license plate format
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
 * Validates if a license plate is unique
 */
export function isLicensePlateUnique(
  licensePlate: string,
  vehicles: Vehicle[],
  currentVehicleId?: string
): { valid: boolean; error?: string } {
  const duplicate = vehicles.find(
    (v) =>
      v.licensePlate.toLowerCase() === licensePlate.toLowerCase() &&
      v.id !== currentVehicleId
  );

  if (duplicate) {
    return {
      valid: false,
      error: 'License plate already exists',
    };
  }

  return { valid: true };
}

/**
 * Validates if a vehicle can transition from one status to another
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
 * Comprehensive validation for creating vehicle(s)
 * Supports both single vehicle and batch creation
 * @param vehiclesToCreate - Single vehicle or array of vehicles to create
 * @param existingVehicles - Existing vehicles array
 * @returns Single ValidationError or array of ValidationErrors (null if valid)
 */
export function validateCreateVehicles(
  vehiclesToCreate:
    | { licensePlate: string; status?: VehicleStatus }
    | Array<{ licensePlate: string; status?: VehicleStatus }>,
  existingVehicles: Vehicle[]
): ValidationError | null | Array<ValidationError | null> {
  // Handle single vehicle creation
  if (!Array.isArray(vehiclesToCreate)) {
    const { licensePlate, status = 'Available' } = vehiclesToCreate;

    // Validate license plate format
    const licensePlateValidation = validateLicensePlate(licensePlate);
    if (!licensePlateValidation.valid) {
      return {
        field: 'licensePlate',
        message: licensePlateValidation.error!,
      };
    }

    // Check uniqueness
    const uniqueValidation = isLicensePlateUnique(licensePlate, existingVehicles);
    if (!uniqueValidation.valid) {
      return {
        field: 'licensePlate',
        message: uniqueValidation.error!,
      };
    }

    // Check maintenance limit if creating with Maintenance status
    if (status === 'Maintenance') {
      const maintenanceValidation = canSetToMaintenance(existingVehicles);
      if (!maintenanceValidation.valid) {
        return {
          field: 'status',
          message: maintenanceValidation.error!,
        };
      }
    }

    return null;
  }

  // Handle batch creation
  const results: Array<ValidationError | null> = [];
  const allLicensePlates = new Set<string>(
    existingVehicles.map((v) => v.licensePlate.toLowerCase())
  );
  const newLicensePlates = new Set<string>();

  // Count maintenance vehicles (existing + those being created)
  let maintenanceCount = existingVehicles.filter(
    (v) => v.status === 'Maintenance'
  ).length;

  const totalVehicles = existingVehicles.length + vehiclesToCreate.length;
  const maxMaintenance = Math.floor(totalVehicles * MAINTENANCE_LIMIT_PERCENTAGE);

  for (const vehicle of vehiclesToCreate) {
    const status = vehicle.status || 'Available';
    const licensePlate = vehicle.licensePlate.trim();

    // Validate license plate format
    const licensePlateValidation = validateLicensePlate(licensePlate);
    if (!licensePlateValidation.valid) {
      results.push({
        field: 'licensePlate',
        message: licensePlateValidation.error!,
      });
      continue;
    }

    const licensePlateLower = licensePlate.toLowerCase();

    // Check for duplicates with existing vehicles
    if (allLicensePlates.has(licensePlateLower)) {
      results.push({
        field: 'licensePlate',
        message: `License plate ${licensePlate} already exists`,
      });
      continue;
    }

    // Check for duplicates within the batch
    if (newLicensePlates.has(licensePlateLower)) {
      results.push({
        field: 'licensePlate',
        message: `Duplicate license plate ${licensePlate} in batch`,
      });
      continue;
    }

    // Check maintenance limit
    if (status === 'Maintenance') {
      if (maintenanceCount >= maxMaintenance) {
        results.push({
          field: 'status',
          message: `Cannot exceed 5% maintenance limit (${maintenanceCount} of ${totalVehicles} vehicles already in maintenance, max allowed: ${maxMaintenance})`,
        });
        continue;
      }
      maintenanceCount++;
    }

    // All validations passed for this vehicle
    newLicensePlates.add(licensePlateLower);
    results.push(null);
  }

  return results;
}

/**
 * Comprehensive validation for updating a vehicle
 */
export function validateUpdateVehicle(
  vehicleId: string,
  currentVehicle: Vehicle,
  updates: { licensePlate?: string; status?: VehicleStatus },
  allVehicles: Vehicle[]
): ValidationError | null {
  // Validate license plate if being updated
  if (updates.licensePlate !== undefined) {
    const licensePlateValidation = validateLicensePlate(updates.licensePlate);
    if (!licensePlateValidation.valid) {
      return {
        field: 'licensePlate',
        message: licensePlateValidation.error!,
      };
    }

    const uniqueValidation = isLicensePlateUnique(
      updates.licensePlate,
      allVehicles,
      vehicleId
    );
    if (!uniqueValidation.valid) {
      return {
        field: 'licensePlate',
        message: uniqueValidation.error!,
      };
    }
  }

  // Validate status transition if status is being updated
  if (updates.status !== undefined) {
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

    // Check maintenance limit if transitioning to Maintenance
    if (updates.status === 'Maintenance') {
      const maintenanceValidation = canSetToMaintenance(allVehicles, vehicleId);
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
