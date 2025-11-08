import { describe, it, expect } from 'vitest';
import {
  canTransitionStatus,
  canDeleteVehicle,
  canSetToMaintenance,
  validateLicensePlate,
  isLicensePlateUnique,
  validateCreateVehicle,
  validateUpdateVehicle,
} from '../lib/validations';
import { Vehicle } from '../types/vehicle';

describe('Validation Functions', () => {
  describe('canTransitionStatus', () => {
    it('should allow Available -> InUse transition', () => {
      const result = canTransitionStatus('Available', 'InUse');
      expect(result.valid).toBe(true);
    });

    it('should allow Available -> Maintenance transition', () => {
      const result = canTransitionStatus('Available', 'Maintenance');
      expect(result.valid).toBe(true);
    });

    it('should allow InUse -> Available transition', () => {
      const result = canTransitionStatus('InUse', 'Available');
      expect(result.valid).toBe(true);
    });

    it('should allow InUse -> Maintenance transition', () => {
      const result = canTransitionStatus('InUse', 'Maintenance');
      expect(result.valid).toBe(true);
    });

    it('should allow Maintenance -> Available transition', () => {
      const result = canTransitionStatus('Maintenance', 'Available');
      expect(result.valid).toBe(true);
    });

    it('should NOT allow Maintenance -> InUse transition', () => {
      const result = canTransitionStatus('Maintenance', 'InUse');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maintenance can only be set to Available');
    });

    it('should allow same status (no transition)', () => {
      const result = canTransitionStatus('Available', 'Available');
      expect(result.valid).toBe(true);
    });
  });

  describe('canDeleteVehicle', () => {
    it('should allow deletion of Available vehicles', () => {
      const result = canDeleteVehicle('Available');
      expect(result.valid).toBe(true);
    });

    it('should NOT allow deletion of InUse vehicles', () => {
      const result = canDeleteVehicle('InUse');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot delete');
    });

    it('should NOT allow deletion of Maintenance vehicles', () => {
      const result = canDeleteVehicle('Maintenance');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot delete');
    });
  });

  describe('canSetToMaintenance', () => {
    it('should allow setting to Maintenance when under 5% limit', () => {
      const vehicles: Vehicle[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        licensePlate: `ABC-${i}`,
        status: 'Available',
        createdAt: new Date().toISOString(),
      }));

      const result = canSetToMaintenance(vehicles);
      expect(result.valid).toBe(true);
    });

    it('should NOT allow setting to Maintenance when at 5% limit', () => {
      const vehicles: Vehicle[] = [
        ...Array.from({ length: 19 }, (_, i) => ({
          id: `${i + 1}`,
          licensePlate: `ABC-${i}`,
          status: 'Available' as const,
          createdAt: new Date().toISOString(),
        })),
        {
          id: '20',
          licensePlate: 'MAINT-1',
          status: 'Maintenance' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      const result = canSetToMaintenance(vehicles);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5% maintenance limit');
    });

    it('should exclude current vehicle from maintenance count when updating', () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-1',
          status: 'Maintenance',
          createdAt: new Date().toISOString(),
        },
        ...Array.from({ length: 19 }, (_, i) => ({
          id: `${i + 2}`,
          licensePlate: `ABC-${i + 2}`,
          status: 'Available' as const,
          createdAt: new Date().toISOString(),
        })),
      ];

      // Should allow because we're updating vehicle '1' which is already in maintenance
      const result = canSetToMaintenance(vehicles, '1');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateLicensePlate', () => {
    it('should validate correct license plate', () => {
      const result = validateLicensePlate('ABC-123');
      expect(result.valid).toBe(true);
    });

    it('should reject empty license plate', () => {
      const result = validateLicensePlate('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject license plate with only whitespace', () => {
      const result = validateLicensePlate('   ');
      expect(result.valid).toBe(false);
    });

    it('should reject license plate shorter than 3 characters', () => {
      const result = validateLicensePlate('AB');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });
  });

  describe('isLicensePlateUnique', () => {
    const vehicles: Vehicle[] = [
      {
        id: '1',
        licensePlate: 'ABC-123',
        status: 'Available',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        licensePlate: 'XYZ-789',
        status: 'InUse',
        createdAt: new Date().toISOString(),
      },
    ];

    it('should validate unique license plate', () => {
      const result = isLicensePlateUnique('NEW-123', vehicles);
      expect(result.valid).toBe(true);
    });

    it('should reject duplicate license plate', () => {
      const result = isLicensePlateUnique('ABC-123', vehicles);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should reject duplicate license plate (case insensitive)', () => {
      const result = isLicensePlateUnique('abc-123', vehicles);
      expect(result.valid).toBe(false);
    });

    it('should allow same license plate when updating same vehicle', () => {
      const result = isLicensePlateUnique('ABC-123', vehicles, '1');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCreateVehicle', () => {
    const vehicles: Vehicle[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      licensePlate: `VEH-${i}`,
      status: 'Available' as const,
      createdAt: new Date().toISOString(),
    }));

    it('should validate valid new vehicle', () => {
      const result = validateCreateVehicle('NEW-123', 'Available', vehicles);
      expect(result).toBeNull();
    });

    it('should reject invalid license plate', () => {
      const result = validateCreateVehicle('AB', 'Available', vehicles);
      expect(result).not.toBeNull();
      expect(result?.field).toBe('licensePlate');
    });

    it('should reject duplicate license plate', () => {
      const result = validateCreateVehicle('VEH-0', 'Available', vehicles);
      expect(result).not.toBeNull();
      expect(result?.field).toBe('licensePlate');
    });

    it('should reject Maintenance status when at limit', () => {
      const vehiclesAtLimit: Vehicle[] = [
        ...vehicles.slice(0, 95),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `${100 + i}`,
          licensePlate: `MAINT-${i}`,
          status: 'Maintenance' as const,
          createdAt: new Date().toISOString(),
        })),
      ];

      const result = validateCreateVehicle('NEW-123', 'Maintenance', vehiclesAtLimit);
      expect(result).not.toBeNull();
      expect(result?.field).toBe('status');
    });
  });

  describe('validateUpdateVehicle', () => {
    const vehicles: Vehicle[] = [
      {
        id: '1',
        licensePlate: 'ABC-123',
        status: 'Available',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        licensePlate: 'XYZ-789',
        status: 'Maintenance',
        createdAt: new Date().toISOString(),
      },
    ];

    it('should validate valid update', () => {
      const result = validateUpdateVehicle(
        '1',
        vehicles[0],
        { status: 'InUse' },
        vehicles
      );
      expect(result).toBeNull();
    });

    it('should reject invalid status transition', () => {
      const result = validateUpdateVehicle(
        '2',
        vehicles[1],
        { status: 'InUse' },
        vehicles
      );
      expect(result).not.toBeNull();
      expect(result?.field).toBe('status');
    });

    it('should reject duplicate license plate', () => {
      const result = validateUpdateVehicle(
        '1',
        vehicles[0],
        { licensePlate: 'XYZ-789' },
        vehicles
      );
      expect(result).not.toBeNull();
      expect(result?.field).toBe('licensePlate');
    });
  });
});
