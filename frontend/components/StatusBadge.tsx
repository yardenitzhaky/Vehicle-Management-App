'use client';

import { VehicleStatus } from '@shared/index';

interface StatusBadgeProps {
  status: VehicleStatus;
  editable?: boolean;
  onChange?: (newStatus: VehicleStatus) => void;
}

const statusConfig: Record<
  VehicleStatus,
  { className: string; label: string }
> = {
  Available: {
    className: 'bg-green-100 text-green-800',
    label: 'Available',
  },
  InUse: {
    className: 'bg-blue-100 text-blue-800',
    label: 'In Use',
  },
  Maintenance: {
    className: 'bg-yellow-100 text-yellow-800',
    label: 'Maintenance',
  },
};

export default function StatusBadge({
  status,
  editable = false,
  onChange
}: StatusBadgeProps) {
  const config = statusConfig[status];

  if (editable && onChange) {
    return (
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as VehicleStatus)}
        className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="Available">Available</option>
        <option value="InUse">In Use</option>
        <option value="Maintenance">Maintenance</option>
      </select>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-transform duration-200 hover:scale-110 ${config.className}`}>
      {config.label}
    </span>
  );
}
