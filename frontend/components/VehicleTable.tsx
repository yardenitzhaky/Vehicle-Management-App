'use client';

import { Vehicle } from '@/types/vehicle';
import StatusBadge from './StatusBadge';
import { canDeleteVehicle } from '@/lib/validations';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: VehicleTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <span className="ml-2 text-gray-400">↕</span>;
    }
    return sortOrder === 'asc' ? (
      <span className="ml-2">↑</span>
    ) : (
      <span className="ml-2">↓</span>
    );
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No vehicles found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new vehicle.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('id')}
            >
              <div className="flex items-center">
                ID
                <SortIcon field="id" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('licensePlate')}
            >
              <div className="flex items-center">
                License Plate
                <SortIcon field="licensePlate" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center">
                Created At
                <SortIcon field="createdAt" />
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => {
            const deleteValidation = canDeleteVehicle(vehicle.status);
            const canDelete = deleteValidation.valid;

            return (
              <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vehicle.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {vehicle.licensePlate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={vehicle.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(vehicle.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(vehicle)}
                    className="text-blue-600 hover:text-blue-900 transition-colors duration-150 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(vehicle)}
                    disabled={!canDelete}
                    className={`transition-colors duration-150 ${
                      canDelete
                        ? 'text-red-600 hover:text-red-900 hover:underline'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={!canDelete ? deleteValidation.error : 'Delete vehicle'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
