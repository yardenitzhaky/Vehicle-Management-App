'use client';

import { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehicleStatus } from '@/types/vehicle';
import VehicleTable from '@/components/VehicleTable';
import VehicleForm from '@/components/VehicleForm';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${'http://localhost:3001'}/api/vehicles?${params}`);
      const result = await response.json();

      if (result.success) {
        setVehicles(result.data);
        setError('');
      } else {
        setError(result.error?.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(undefined);
    setIsFormOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (data: {
    licensePlate: string;
    status: VehicleStatus;
  }) => {
    setIsSubmitting(true);
    const isEditing = !!editingVehicle;
    const previousData = editingVehicle ? {
      licensePlate: editingVehicle.licensePlate,
      status: editingVehicle.status,
    } : null;

    try {
      let response;
      if (editingVehicle) {
        // Update existing vehicle
        response = await fetch(`${'http://localhost:3001'}/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        // Create new vehicle
        response = await fetch(`${'http://localhost:3001'}/api/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();

      if (result.success) {
        setIsFormOpen(false);
        setEditingVehicle(undefined);
        fetchVehicles();

        // Show success toast with animation
        if (isEditing && previousData) {
          const changes: string[] = [];
          if (previousData.licensePlate !== data.licensePlate) {
            changes.push(`License Plate: ${previousData.licensePlate} → ${data.licensePlate}`);
          }
          if (previousData.status !== data.status) {
            changes.push(`Status: ${previousData.status} → ${data.status}`);
          }

          toast.success(
            changes.length > 0
              ? `Vehicle updated!\n${changes.join('\n')}`
              : 'Vehicle updated successfully!',
            {
              duration: 4000,
              style: {
                background: '#10b981',
                color: '#fff',
                whiteSpace: 'pre-line',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            }
          );
        } else {
          toast.success(`Vehicle ${data.licensePlate} created successfully!`, {
            duration: 4000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          });
        }
      } else {
        throw new Error(result.error?.message || 'Failed to save vehicle');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;

    const vehiclePlate = deletingVehicle.licensePlate;
    setIsDeleting(true);
    try {
      const response = await fetch(`${'http://localhost:3001'}/api/vehicles/${deletingVehicle.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setDeleteConfirmOpen(false);
        setDeletingVehicle(undefined);
        fetchVehicles();
        toast.success(`Vehicle ${vehiclePlate} deleted successfully!`, {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        });
      } else {
        toast.error(result.error?.message || 'Failed to delete vehicle');
      }
    } catch (err) {
      toast.error('Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'Available').length,
    inUse: vehicles.filter((v) => v.status === 'InUse').length,
    maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Vehicle Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your fleet of vehicles with ease
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8"
        >
          {[
            { label: 'Total Vehicles', value: stats.total, color: 'text-gray-900' },
            { label: 'Available', value: stats.available, color: 'text-green-600' },
            { label: 'In Use', value: stats.inUse, color: 'text-blue-600' },
            { label: 'Maintenance', value: stats.maintenance, color: 'text-yellow-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.label}
                </dt>
                <dd className={`mt-1 text-3xl font-semibold ${stat.color}`}>
                  {stat.value}
                </dd>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Actions */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 transition-colors duration-200"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="InUse">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleAddVehicle}
                className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Vehicle
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow"
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <VehicleTable
                vehicles={vehicles}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={isFormOpen}
        vehicle={editingVehicle}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingVehicle(undefined);
        }}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteConfirmOpen}
        vehicleLicensePlate={deletingVehicle?.licensePlate || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingVehicle(undefined);
        }}
        isDeleting={isDeleting}
      />
    </main>
  );
}
