import { NextRequest, NextResponse } from 'next/server';
import { readVehicles, writeVehicles } from '@/lib/db';
import {
  validateUpdateVehicle,
  canDeleteVehicle,
} from '@/lib/validations';
import { UpdateVehicleDto } from '@/types/vehicle';

/**
 * PUT /api/vehicles/[id]
 * Updates an existing vehicle
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateVehicleDto = await request.json();

    const vehicles = await readVehicles();
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return NextResponse.json(
        { error: { message: 'Vehicle not found' }, success: false },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: validationError, success: false },
        { status: 400 }
      );
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

    return NextResponse.json({ data: updatedVehicle, success: true });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: { message: 'Failed to update vehicle' }, success: false },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vehicles/[id]
 * Deletes a vehicle
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const vehicles = await readVehicles();
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return NextResponse.json(
        { error: { message: 'Vehicle not found' }, success: false },
        { status: 404 }
      );
    }

    const vehicle = vehicles[vehicleIndex];

    // Validate deletion
    const deleteValidation = canDeleteVehicle(vehicle.status);
    if (!deleteValidation.valid) {
      return NextResponse.json(
        { error: { message: deleteValidation.error }, success: false },
        { status: 400 }
      );
    }

    // Remove the vehicle
    vehicles.splice(vehicleIndex, 1);
    await writeVehicles(vehicles);

    return NextResponse.json(
      { data: { id }, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: { message: 'Failed to delete vehicle' }, success: false },
      { status: 500 }
    );
  }
}
