import { NextRequest, NextResponse } from 'next/server';
import {
  readVehicles,
  writeVehicles,
  generateId,
} from '@/lib/db';
import { validateCreateVehicle } from '@/lib/validations';
import { CreateVehicleDto, Vehicle } from '@/types/vehicle';

/**
 * GET /api/vehicles
 * Returns all vehicles with optional filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let vehicles = await readVehicles();

    // Filter by status
    if (status && status !== 'all') {
      vehicles = vehicles.filter((v) => v.status === status);
    }

    // Search by license plate
    if (search) {
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

    return NextResponse.json({ data: vehicles, success: true });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch vehicles' }, success: false },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vehicles
 * Creates a new vehicle
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateVehicleDto = await request.json();
    const { licensePlate, status = 'Available' } = body;

    const vehicles = await readVehicles();

    // Validate the new vehicle
    const validationError = validateCreateVehicle(
      licensePlate,
      status,
      vehicles
    );

    if (validationError) {
      return NextResponse.json(
        { error: validationError, success: false },
        { status: 400 }
      );
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

    return NextResponse.json(
      { data: newVehicle, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create vehicle' }, success: false },
      { status: 500 }
    );
  }
}
