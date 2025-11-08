
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle, VehicleStatus } from '@shared/index';
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
    try {
      const createdVehicle = await vehicleService.createVehicle(data);
      setVehicles((prev) => [createdVehicle, ...prev]);
      toast.success(`Vehicle ${data.licensePlate} created successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create vehicle');
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

  const confirmedVehicles = vehicles.filter((v) => !v.id.startsWith('temp-'));

  const stats = useMemo(() => {
    return {
      total: confirmedVehicles.length,
      available: confirmedVehicles.filter((v) => v.status === 'Available').length,
      inUse: confirmedVehicles.filter((v) => v.status === 'InUse').length,
      maintenance: confirmedVehicles.filter((v) => v.status === 'Maintenance').length,
    };
  }, [confirmedVehicles]);

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
