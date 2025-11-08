import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

import {
  readVehicles,
  writeVehicles,
  generateId,
} from '../src/db'; // Import original db functions
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  canDeleteVehicle,
} from '../src/validations';
import { CreateVehicleDto, UpdateVehicleDto, Vehicle } from '@shared/index';

// Mock the db module
vi.mock('../src/db', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readVehicles: vi.fn(),
    writeVehicles: vi.fn(),
    generateId: vi.fn(),
  };
});

const mockReadVehicles = vi.mocked(readVehicles);
const mockWriteVehicles = vi.mocked(writeVehicles);
const mockGenerateId = vi.mocked(generateId);

// Create a test Express app


// Re-import the routes after mocking db
import app from '../src/index';


describe('Vehicle API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockReadVehicles.mockReset();
    mockWriteVehicles.mockReset();
    mockGenerateId.mockReset();
  });

  describe('GET /api/vehicles', () => {
    it('should return all vehicles', async () => {
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
      mockReadVehicles.mockResolvedValue(vehicles);

      const res = await request(app).get('/api/vehicles');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(vehicles);
    });

    it('should filter vehicles by status', async () => {
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
      mockReadVehicles.mockResolvedValue(vehicles);

      const res = await request(app).get('/api/vehicles?status=InUse');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([vehicles[1]]);
    });

    it('should search vehicles by license plate', async () => {
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
      mockReadVehicles.mockResolvedValue(vehicles);

      const res = await request(app).get('/api/vehicles?search=abc');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([vehicles[0]]);
    });

    it('should sort vehicles by createdAt in descending order (default)', async () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
        },
        {
          id: '2',
          licensePlate: 'XYZ-789',
          status: 'InUse',
          createdAt: new Date('2023-01-02T10:00:00Z').toISOString(),
        },
      ];
      mockReadVehicles.mockResolvedValue([...vehicles]);

      const res = await request(app).get('/api/vehicles');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([vehicles[1], vehicles[0]]);
    });

    it('should sort vehicles by createdAt in ascending order', async () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: new Date('2023-01-02T10:00:00Z').toISOString(),
        },
        {
          id: '2',
          licensePlate: 'XYZ-789',
          status: 'InUse',
          createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
        },
      ];
      mockReadVehicles.mockResolvedValue([...vehicles]);

      const res = await request(app).get('/api/vehicles?sortBy=createdAt&sortOrder=asc');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([vehicles[1], vehicles[0]]);
    });

    it('should sort vehicles by licensePlate in ascending order', async () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'XYZ-789',
          status: 'Available',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          licensePlate: 'ABC-123',
          status: 'InUse',
          createdAt: new Date().toISOString(),
        },
      ];
      mockReadVehicles.mockResolvedValue([...vehicles]);

      const res = await request(app).get('/api/vehicles?sortBy=licensePlate&sortOrder=asc');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([vehicles[1], vehicles[0]]);
    });

    it('should handle errors during fetching vehicles', async () => {
      mockReadVehicles.mockRejectedValue(new Error('DB read error'));

      const res = await request(app).get('/api/vehicles');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('DB read error');
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle successfully', async () => {
      const newVehicleData = {
        licensePlate: 'NEW-456',
        status: 'Available',
      };
      const createdVehicle = {
        id: '1',
        createdAt: new Date().toISOString(),
        ...newVehicleData,
      };

      mockReadVehicles.mockResolvedValue([]);
      mockGenerateId.mockReturnValue('1');
      mockWriteVehicles.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/vehicles')
        .send(newVehicleData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        ...newVehicleData,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
      expect(mockWriteVehicles).toHaveBeenCalledWith([
        expect.objectContaining(newVehicleData),
      ]);
    });

    it('should return 400 if license plate is invalid', async () => {
      const newVehicleData = {
        licensePlate: 'AB',
        status: 'Available',
      };

      mockReadVehicles.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/vehicles')
        .send(newVehicleData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.field).toBe('licensePlate');
    });

    it('should return 400 if license plate is not unique', async () => {
      const existingVehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: new Date().toISOString(),
        },
      ];
      const newVehicleData = {
        licensePlate: 'ABC-123',
        status: 'Available',
      };

      mockReadVehicles.mockResolvedValue(existingVehicles);

      const res = await request(app)
        .post('/api/vehicles')
        .send(newVehicleData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.field).toBe('licensePlate');
    });

    it('should return 400 if maintenance limit is exceeded', async () => {
      const vehiclesAtLimit: Vehicle[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        licensePlate: `VEH-${String(i).padStart(3, '0')}`,
        status: i < 19 ? 'Available' : 'Maintenance',
        createdAt: new Date().toISOString(),
      }));

      const newVehicleData = {
        licensePlate: 'MNT-123',
        status: 'Maintenance',
      };

      mockReadVehicles.mockResolvedValue(vehiclesAtLimit);

      const res = await request(app)
        .post('/api/vehicles')
        .send(newVehicleData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.field).toBe('status');
    });

    it('should handle errors during vehicle creation', async () => {
      const newVehicleData = {
        licensePlate: 'NEW-456',
        status: 'Available',
      };

      mockReadVehicles.mockResolvedValue([]);
      mockGenerateId.mockReturnValue('1');
      mockWriteVehicles.mockRejectedValue(new Error('DB write error'));

      const res = await request(app)
        .post('/api/vehicles')
        .send(newVehicleData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('DB write error');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update an existing vehicle successfully', async () => {
      const existingVehicle: Vehicle = {
        id: '1',
        licensePlate: 'OLD-123',
        status: 'Available',
        createdAt: new Date().toISOString(),
      };
      const updatedData = {
        licensePlate: 'UPD-456',
        status: 'InUse',
      };
      const expectedVehicle = { ...existingVehicle, ...updatedData };

      mockReadVehicles.mockResolvedValue([existingVehicle]);
      mockWriteVehicles.mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/vehicles/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(expectedVehicle);
      expect(mockWriteVehicles).toHaveBeenCalledWith([expectedVehicle]);
    });

    it('should return 404 if vehicle not found', async () => {
      mockReadVehicles.mockResolvedValue([]);

      const res = await request(app)
        .put('/api/vehicles/999')
        .send({ status: 'InUse' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Vehicle not found');
    });

    it('should return 400 for invalid status transition (Maintenance to InUse)', async () => {
      const existingVehicle: Vehicle = {
        id: '1',
        licensePlate: 'MNT-001',
        status: 'Maintenance',
        createdAt: new Date().toISOString(),
      };

      mockReadVehicles.mockResolvedValue([existingVehicle]);

      const res = await request(app)
        .put('/api/vehicles/1')
        .send({ status: 'InUse' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.field).toBe('status');
    });

    it('should return 400 for duplicate license plate', async () => {
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

      mockReadVehicles.mockResolvedValue(vehicles);

      const res = await request(app)
        .put('/api/vehicles/1')
        .send({ licensePlate: 'XYZ-789' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.field).toBe('licensePlate');
    });

    it('should handle errors during vehicle update', async () => {
      const existingVehicle: Vehicle = {
        id: '1',
        licensePlate: 'OLD-123',
        status: 'Available',
        createdAt: new Date().toISOString(),
      };

      mockReadVehicles.mockResolvedValue([existingVehicle]);
      mockWriteVehicles.mockRejectedValue(new Error('DB write error'));

      const res = await request(app)
        .put('/api/vehicles/1')
        .send({ status: 'InUse' });

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('DB write error');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete an available vehicle successfully', async () => {
      const vehicleToDelete: Vehicle = {
        id: '1',
        licensePlate: 'DEL-123',
        status: 'Available',
        createdAt: new Date().toISOString(),
      };
      mockReadVehicles.mockResolvedValue([vehicleToDelete]);
      mockWriteVehicles.mockResolvedValue(undefined);

      const res = await request(app).delete('/api/vehicles/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ id: '1' });
      expect(mockWriteVehicles).toHaveBeenCalledWith([]);
    });

    it('should return 404 if vehicle not found', async () => {
      mockReadVehicles.mockResolvedValue([]);

      const res = await request(app).delete('/api/vehicles/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Vehicle not found');
    });

    it('should return 400 if trying to delete an InUse vehicle', async () => {
      const vehicleToDelete: Vehicle = {
        id: '1',
        licensePlate: 'DEL-123',
        status: 'InUse',
        createdAt: new Date().toISOString(),
      };
      mockReadVehicles.mockResolvedValue([vehicleToDelete]);

      const res = await request(app).delete('/api/vehicles/1');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Cannot delete');
    });

    it('should return 400 if trying to delete a Maintenance vehicle', async () => {
      const vehicleToDelete: Vehicle = {
        id: '1',
        licensePlate: 'DEL-123',
        status: 'Maintenance',
        createdAt: new Date().toISOString(),
      };
      mockReadVehicles.mockResolvedValue([vehicleToDelete]);

      const res = await request(app).delete('/api/vehicles/1');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Cannot delete');
    });

    it('should handle errors during vehicle deletion', async () => {
      const vehicleToDelete: Vehicle = {
        id: '1',
        licensePlate: 'DEL-123',
        status: 'Available',
        createdAt: new Date().toISOString(),
      };
      mockReadVehicles.mockResolvedValue([vehicleToDelete]);
      mockWriteVehicles.mockRejectedValue(new Error('DB write error'));

      const res = await request(app).delete('/api/vehicles/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('DB write error');
    });
  });

  describe('/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});
