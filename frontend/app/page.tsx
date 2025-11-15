'use client';

import { useState } from 'react';
import { Vehicle, VehicleStatus } from '@shared/index';
import VehicleTable from '@/components/VehicleTable';
import VehicleForm from '@/components/VehicleForm';
import BatchVehicleForm from '@/components/BatchVehicleForm';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import { motion, AnimatePresence } from 'framer-motion';
import { StatBox } from '@/components/StatBox';
import { useVehicles } from '@/hooks/useVehicles';
import { exportToCSV, generateTimestampedFilename } from '@/lib/csvExport';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const {
    vehicles,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    handleSort,
    createVehicles,
    updateVehicle,
    deleteVehicle,
    stats,
  } = useVehicles();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

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

    try {
      if (isEditing && editingVehicle) {
        await updateVehicle(editingVehicle.id, data);
      } else {
        await createVehicles(data);
      }
      setIsFormOpen(false);
      setEditingVehicle(undefined);
    } catch (err) {
      // Errors are already handled by the hook's toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;

    setIsDeleting(true);
    try {
      await deleteVehicle(deletingVehicle.id, deletingVehicle.licensePlate);
      setDeleteConfirmOpen(false);
      setDeletingVehicle(undefined);
    } catch (err) { // Errors are already handled by the hook's toast notifications
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToCSV = () => {
    if (vehicles.length === 0) {
      toast.error('No vehicles to export');
      return;
    }

    try {
      const filename = generateTimestampedFilename();
      exportToCSV(vehicles, filename);
      toast.success(`Exported ${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} to CSV`);
    } catch (err) {
      toast.error('Failed to export vehicles');
      console.error('Export error:', err);
    }
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
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse">
            Vehicle Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Your fleet, at a glance.
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
            <StatBox
              key={stat.label}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              index={index}
            />
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
            <div className="flex gap-2">
              <button
                onClick={handleExportToCSV}
                disabled={vehicles.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-green-600"
                title="Export to CSV"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => setIsBatchFormOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm hover:bg-purple-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center transition-all duration-200 transform hover:scale-105"
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
                Add Multiple
              </button>
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
        vehicles={vehicles} // Pass the vehicles array
      />

      {/* Batch Vehicle Form Modal */}
      <BatchVehicleForm
        isOpen={isBatchFormOpen}
        onSubmit={(vehicles) => createVehicles(vehicles)}
        onCancel={() => setIsBatchFormOpen(false)}
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