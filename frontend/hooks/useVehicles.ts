
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle, VehicleStatus, ApiResponse } from '@shared/index';
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

  const createVehicles = async (
    data:
      | { licensePlate: string; status: VehicleStatus }
      | Array<{ licensePlate: string; status?: VehicleStatus }>
  ): Promise<Vehicle | ApiResponse<Vehicle[]>> => {
    try {
      const result = await vehicleService.createVehicles(data);

      // Handle single vehicle creation
      if (!Array.isArray(data)) {
        const createdVehicle = result as Vehicle;
        setVehicles((prev) => [createdVehicle, ...prev]);
        toast.success(`Vehicle ${data.licensePlate} created successfully!`);
        return createdVehicle;
      }

      // Handle batch creation
      const batchResult = result as ApiResponse<Vehicle[]>;

      // Add successfully created vehicles to the state
      const successfulVehicles = batchResult.results
        ?.filter((r) => r.success && r.vehicle)
        .map((r) => r.vehicle!) || [];

      if (successfulVehicles.length > 0) {
        setVehicles((prev) => [...successfulVehicles, ...prev]);
      }

      // Show appropriate toast messages
      const successCount = batchResult.successCount || 0;
      const failureCount = batchResult.failureCount || 0;

      if (successCount > 0 && failureCount === 0) {
        toast.success(
          `Successfully created ${successCount} vehicle${
            successCount !== 1 ? 's' : ''
          }!`
        );
      } else if (successCount > 0 && failureCount > 0) {
        toast.success(
          `Created ${successCount} vehicle${
            successCount !== 1 ? 's' : ''
          }. ${failureCount} failed.`,
          { duration: 4000 }
        );
      } else {
        toast.error(`Failed to create all ${failureCount} vehicles`);
      }

      return batchResult;
    } catch (err) {
      const errorMessage = Array.isArray(data)
        ? 'Failed to create vehicles'
        : 'Failed to create vehicle';
      toast.error(err instanceof Error ? err.message : errorMessage);
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

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === 'Available').length,
      inUse: vehicles.filter((v) => v.status === 'InUse').length,
      maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
    };
  }, [vehicles]);

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
    createVehicles,
    updateVehicle,
    deleteVehicle,
    stats,
  };
};
