import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  readVehicles,
  writeVehicles,
  generateIds,
} from './db';
import {
  validateCreateVehicles,
  validateUpdateVehicle,
  canDeleteVehicle,
} from './validations';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  Vehicle,
  BatchVehicleResult,
  ApiResponse,
  ValidationError,
} from '@shared/index';

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
    const sortField = sortBy as keyof Vehicle;
    const aVal = a[sortField];
    const bVal = b[sortField];
    let cmp = 0;

    if (sortField === 'id') {
      // Handle numeric sorting for IDs
      cmp = parseInt(aVal, 10) - parseInt(bVal, 10);
    } else if (sortField === 'createdAt') {
      // Handle date sorting
      cmp = new Date(aVal).getTime() - new Date(bVal).getTime();
    } else {
      // Handle string sorting for licensePlate, status, etc.
      cmp = aVal.localeCompare(bVal);
    }

    // Apply sort order
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  res.json({ data: sortedVehicles, success: true });
}));

/**
 * POST /api/vehicles
 * Creates one or more vehicles
 */
app.post('/api/vehicles', asyncHandler(async (req: Request, res: Response) => {
  const body: CreateVehicleDto = req.body;
  const { licensePlate, status = 'Available', vehicles: vehiclesToCreate } = body;

  const existingVehicles = await readVehicles();
  const createdAt = new Date().toISOString();

  // Handle batch creation
  if (vehiclesToCreate && Array.isArray(vehiclesToCreate)) {
    if (vehiclesToCreate.length === 0) {
      return res.status(400).json({
        error: { message: 'Invalid request: vehicles array cannot be empty' },
        success: false,
      });
    }

    // Validate all vehicles in the batch
    const validationResults = validateCreateVehicles(
      vehiclesToCreate,
      existingVehicles
    ) as Array<ValidationError | null>;

    // Prepare results array
    const results: BatchVehicleResult[] = [];
    const successfulVehicles: Vehicle[] = [];
    const newIds = generateIds(existingVehicles, vehiclesToCreate.length) as string[];

    // Process each vehicle
    vehiclesToCreate.forEach((vehicleDto, index) => {
      const validationError = validationResults[index];

      if (validationError) {
        // This vehicle failed validation
        results.push({
          error: validationError,
          success: false,
          index,
        });
      } else {
        // This vehicle passed validation
        const newVehicle: Vehicle = {
          id: newIds[index],
          licensePlate: vehicleDto.licensePlate.trim(),
          status: vehicleDto.status || 'Available',
          createdAt,
        };

        successfulVehicles.push(newVehicle);
        results.push({
          vehicle: newVehicle,
          success: true,
          index,
        });
      }
    });

    // Save only the successful vehicles
    if (successfulVehicles.length > 0) {
      const updatedVehicles = [...existingVehicles, ...successfulVehicles];
      await writeVehicles(updatedVehicles);
    }

    const response: ApiResponse<Vehicle[]> = {
      data: successfulVehicles,
      results,
      successCount: successfulVehicles.length,
      failureCount: vehiclesToCreate.length - successfulVehicles.length,
      success: successfulVehicles.length > 0,
    };

    // Return 207 Multi-Status if some succeeded and some failed
    // Return 201 if all succeeded
    // Return 400 if all failed
    const statusCode =
      successfulVehicles.length === vehiclesToCreate.length
        ? 201
        : successfulVehicles.length > 0
        ? 207
        : 400;

    return res.status(statusCode).json(response);
  }

  // Handle single vehicle creation
  if (!licensePlate) {
    return res.status(400).json({
      error: { message: 'License plate is required' },
      success: false,
    });
  }

  // Validate the new vehicle
  const validationError = validateCreateVehicles(
    { licensePlate, status },
    existingVehicles
  ) as ValidationError | null;

  if (validationError) {
    return res.status(400).json({
      error: validationError,
      success: false,
    });
  }

  // Create new vehicle
  const newVehicle: Vehicle = {
    id: generateIds(existingVehicles) as string,
    licensePlate: licensePlate.trim(),
    status,
    createdAt,
  };

  existingVehicles.push(newVehicle);
  await writeVehicles(existingVehicles);

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