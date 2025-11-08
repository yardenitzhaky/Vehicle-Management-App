
import { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehicleStatus } from '@/lib/validations';
import * as vehicleService from '@/services/vehicleService';
import toast from 'react-hot-toast';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vehicleService.fetchVehicles({
        statusFilter,
        searchTerm,
        sortBy,
        sortOrder,
      });
      setVehicles(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
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

  const createVehicle = async (data: {
    licensePlate: string;
    status: VehicleStatus;
  }) => {
    const tempId = `temp-${Date.now()}`;
    const newVehicle: Vehicle = {
      id: tempId,
      ...data,
      createdAt: new Date().toISOString(),
    };

    setVehicles((prev) => [newVehicle, ...prev]);

    try {
      const createdVehicle = await vehicleService.createVehicle(data);
      setVehicles((prev) =>
        prev.map((v) => (v.id === tempId ? createdVehicle : v))
      );
      toast.success(`Vehicle ${data.licensePlate} created successfully!`);
    } catch (err) {
      setVehicles((prev) => prev.filter((v) => v.id !== tempId));
      toast.error(
        err instanceof Error ? err.message : 'Failed to create vehicle'
      );
      throw err;
    }
  };

  const updateVehicle = async (
    id: string,
    data: {
      licensePlate: string;
      status: VehicleStatus;
    }
  ) => {
    const originalVehicles = [...vehicles];
    const updatedVehicle = {
      ...vehicles.find((v) => v.id === id)!,
      ...data,
    };

    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? updatedVehicle : v))
    );

    try {
      await vehicleService.updateVehicle(id, data);
      toast.success(`Vehicle ${data.licensePlate} updated successfully!`);
    } catch (err) {
      setVehicles(originalVehicles);
      toast.error(
        err instanceof Error ? err.message : 'Failed to update vehicle'
      );
      throw err;
    }
  };

  const deleteVehicle = async (id: string, licensePlate: string) => {
    const originalVehicles = [...vehicles];
    setVehicles((prev) => prev.filter((v) => v.id !== id));

    try {
      await vehicleService.deleteVehicle(id);
      toast.success(`Vehicle ${licensePlate} deleted successfully!`);
    } catch (err) {
      setVehicles(originalVehicles);
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete vehicle'
      );
      throw err;
    }
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'Available').length,
    inUse: vehicles.filter((v) => v.status === 'InUse').length,
    maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
  };

  return {
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
    createVehicle,
    updateVehicle,
    deleteVehicle,
    stats,
  };
};
