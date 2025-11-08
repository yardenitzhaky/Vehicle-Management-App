import express, { Request, Response } from 'express';
import {
  readVehicles,
  writeVehicles,
  generateId,
} from '@/lib/db';
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  canDeleteVehicle,
} from '@/lib/validations';
import { CreateVehicleDto, UpdateVehicleDto, Vehicle } from '@/types/vehicle';

const router = express.Router();

/**
 * GET /api/vehicles
 * Returns all vehicles with optional filtering and sorting
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let vehicles = await readVehicles();

    // Filter by status
    if (status && status !== 'all') {
      vehicles = vehicles.filter((v) => v.status === status);
    }

    // Search by license plate
    if (search && typeof search === 'string') {
      vehicles = vehicles.filter((v) =>
        v.licensePlate.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort vehicles
    vehicles.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof Vehicle];
      let bValue: string | number = b[sortBy as keyof Vehicle];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    res.json({ data: vehicles, success: true });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch vehicles' },
      success: false,
    });
  }
});

/**
 * POST /api/vehicles
 * Creates a new vehicle
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const body: CreateVehicleDto = req.body;
    const { licensePlate, status = 'Available' } = body;

    const vehicles = await readVehicles();

    // Validate the new vehicle
    const validationError = validateCreateVehicle(
      licensePlate,
      status,
      vehicles
    );

    if (validationError) {
      return res.status(400).json({
        error: validationError,
        success: false,
      });
    }

    // Create new vehicle
    const newVehicle: Vehicle = {
      id: generateId(vehicles),
      licensePlate: licensePlate.trim(),
      status,
      createdAt: new Date().toISOString(),
    };

    vehicles.push(newVehicle);
    await writeVehicles(vehicles);

    res.status(201).json({
      data: newVehicle,
      success: true,
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      error: { message: 'Failed to create vehicle' },
      success: false,
    });
  }
});

/**
 * PUT /api/vehicles/:id
 * Updates an existing vehicle
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body: UpdateVehicleDto = req.body;

    const vehicles = await readVehicles();
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return res.status(404).json({
        error: { message: 'Vehicle not found' },
        success: false,
      });
    }

    const currentVehicle = vehicles[vehicleIndex];

    // Validate the update
    const validationError = validateUpdateVehicle(
      id,
      currentVehicle,
      body,
      vehicles
    );

    if (validationError) {
      return res.status(400).json({
        error: validationError,
        success: false,
      });
    }

    // Update the vehicle
    const updatedVehicle = {
      ...currentVehicle,
      ...(body.licensePlate !== undefined && {
        licensePlate: body.licensePlate.trim(),
      }),
      ...(body.status !== undefined && { status: body.status }),
    };

    vehicles[vehicleIndex] = updatedVehicle;
    await writeVehicles(vehicles);

    res.json({ data: updatedVehicle, success: true });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      error: { message: 'Failed to update vehicle' },
      success: false,
    });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Deletes a vehicle
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicles = await readVehicles();
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return res.status(404).json({
        error: { message: 'Vehicle not found' },
        success: false,
      });
    }

    const vehicle = vehicles[vehicleIndex];

    // Validate deletion
    const deleteValidation = canDeleteVehicle(vehicle.status);
    if (!deleteValidation.valid) {
      return res.status(400).json({
        error: { message: deleteValidation.error },
        success: false,
      });
    }

    // Remove the vehicle
    vehicles.splice(vehicleIndex, 1);
    await writeVehicles(vehicles);

    res.json({
      data: { id },
      success: true,
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      error: { message: 'Failed to delete vehicle' },
      success: false,
    });
  }
});

export default router;
