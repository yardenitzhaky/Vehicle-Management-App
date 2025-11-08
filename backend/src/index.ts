import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  readVehicles,
  writeVehicles,
  generateId,
} from './db';
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  canDeleteVehicle,
} from './validations';
import { CreateVehicleDto, UpdateVehicleDto, Vehicle } from '@shared/index';

const app = express();
export const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Async error handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes
/**
 * GET /api/vehicles
 * Returns all vehicles with optional filtering and sorting
 */
app.get('/api/vehicles', asyncHandler(async (req: Request, res: Response) => {
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
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aVal = a[sortBy as keyof Vehicle];
    const bVal = b[sortBy as keyof Vehicle];
    const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  res.json({ data: sortedVehicles, success: true });
}));

/**
 * POST /api/vehicles
 * Creates a new vehicle
 */
app.post('/api/vehicles', asyncHandler(async (req: Request, res: Response) => {
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
}));

/**
 * PUT /api/vehicles/:id
 * Updates an existing vehicle
 */
app.put('/api/vehicles/:id', asyncHandler(async (req: Request, res: Response) => {
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
}));

/**
 * DELETE /api/vehicles/:id
 * Deletes a vehicle
 */
app.delete('/api/vehicles/:id', asyncHandler(async (req: Request, res: Response) => {
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
}));


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (must be after all routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: { message: err.message || 'Internal server error' },
    success: false,
  });
});

if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;