'use client';

import { VehicleStatus } from '@shared/index';

interface StatusBadgeProps {
  status: VehicleStatus;
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

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-transform duration-200 hover:scale-110 ${config.className}`}>
      {config.label}
    </span>
  );
}
