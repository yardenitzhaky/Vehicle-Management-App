'use client';

import { useState, useEffect } from 'react';
import {
  Vehicle,
  VehicleStatus,
  validateCreateVehicle,
  validateUpdateVehicle,
  canTransitionStatus,
} from '@/lib/validations';

interface VehicleFormProps {
  isOpen: boolean;
  vehicle?: Vehicle;
  onSubmit: (data: {
    licensePlate: string;
    status: VehicleStatus;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  vehicles: Vehicle[]; // Added to pass for validation
}

const statusOptions: { value: VehicleStatus; label: string }[] = [
  { value: 'Available', label: 'Available' },
  { value: 'InUse', label: 'In Use' },
  { value: 'Maintenance', label: 'Maintenance' },
];

export default function VehicleForm({
  isOpen,
  vehicle,
  onSubmit,
  onCancel,
  isSubmitting,
  vehicles,
}: VehicleFormProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicle) {
      setLicensePlate(vehicle.licensePlate);
      setStatus(vehicle.status);
    } else {
      setLicensePlate('');
      setStatus('Available');
    }
    setError('');
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let validationError = null;

    if (vehicle) {
      // Editing existing vehicle
      validationError = validateUpdateVehicle(
        vehicle.id,
        vehicle,
        { licensePlate: licensePlate.trim(), status },
        vehicles
      );
    } else {
      // Creating new vehicle
      validationError = validateCreateVehicle(
        licensePlate.trim(),
        status,
        vehicles
      );
    }

    if (validationError) {
      setError(validationError.message);
      return;
    }

    try {
      await onSubmit({ licensePlate: licensePlate.trim(), status });
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="licensePlate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                License Plate
              </label>
              <input
                type="text"
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200"
                placeholder="ABC-123"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer"
                disabled={isSubmitting}
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={
                      !!vehicle &&
                      !canTransitionStatus(vehicle.status, option.value).valid
                    }
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {vehicle && vehicle.status === 'Maintenance' && (
                <p className="mt-1 text-xs text-gray-500">
                  Vehicles in Maintenance can only be set to Available
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? 'Saving...' : vehicle ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
