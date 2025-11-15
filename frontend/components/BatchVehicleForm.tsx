'use client';

import { useState } from 'react';
import {
  VehicleStatus,
  ApiResponse,
  Vehicle,
  BatchVehicleResult,
} from '@shared/index';
import { X, Plus, Trash2 } from 'lucide-react';

interface BatchVehicleFormProps {
  isOpen: boolean;
  onSubmit: (
    vehicles: Array<{ licensePlate: string; status?: VehicleStatus }>
  ) => Promise<Vehicle | ApiResponse<Vehicle[]>>;
  onCancel: () => void;
}

interface VehicleInput {
  id: string;
  licensePlate: string;
  status: VehicleStatus;
}

const statusOptions: { value: VehicleStatus; label: string }[] = [
  { value: 'Available', label: 'Available' },
  { value: 'InUse', label: 'In Use' },
  { value: 'Maintenance', label: 'Maintenance' },
];

export default function BatchVehicleForm({
  isOpen,
  onSubmit,
  onCancel,
}: BatchVehicleFormProps) {
  const [vehicles, setVehicles] = useState<VehicleInput[]>([
    { id: '1', licensePlate: '', status: 'Available' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<BatchVehicleResult[] | null>(null);

  const addVehicle = () => {
    const newId = (Math.max(...vehicles.map((v) => parseInt(v.id))) + 1).toString();
    setVehicles([
      ...vehicles,
      { id: newId, licensePlate: '', status: 'Available' },
    ]);
  };

  const removeVehicle = (id: string) => {
    if (vehicles.length === 1) return; // Keep at least one
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  const updateVehicle = (id: string, field: 'licensePlate' | 'status', value: string) => {
    setVehicles(
      vehicles.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResults(null);

    try {
      const vehiclesToCreate = vehicles.map((v) => ({
        licensePlate: v.licensePlate,
        status: v.status,
      }));

      const result = await onSubmit(vehiclesToCreate);

      // Since we're always passing an array, result should be ApiResponse<Vehicle[]>
      const batchResult = result as ApiResponse<Vehicle[]>;

      if (batchResult.results) {
        setResults(batchResult.results);
      }

      // If all succeeded, close the form
      if ((batchResult.failureCount || 0) === 0) {
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Batch creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVehicles([{ id: '1', licensePlate: '', status: 'Available' }]);
    setResults(null);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Add Multiple Vehicles
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto mb-4">
            <div className="space-y-3">
              {vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="flex gap-3 items-start p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-500 pt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={vehicle.licensePlate}
                      onChange={(e) =>
                        updateVehicle(vehicle.id, 'licensePlate', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200"
                      placeholder="ABC-123"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={vehicle.status}
                      onChange={(e) =>
                        updateVehicle(
                          vehicle.id,
                          'status',
                          e.target.value as VehicleStatus
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVehicle(vehicle.id)}
                    disabled={vehicles.length === 1 || isSubmitting}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove vehicle"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {results && results[index] && (
                    <div className="flex-shrink-0 w-6">
                      {results[index].success ? (
                        <span className="text-green-600 text-xl">✓</span>
                      ) : (
                        <span className="text-red-600 text-xl">✗</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {results && results.some((r) => !r.success) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                <ul className="space-y-1">
                  {results.map(
                    (result, index) =>
                      !result.success && (
                        <li key={index} className="text-sm text-red-600">
                          Row {index + 1}: {result.error?.message}
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={addVehicle}
            disabled={isSubmitting}
            className="w-full mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Vehicle
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? 'Creating...' : `Create ${vehicles.length} Vehicle${vehicles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
