import { Vehicle } from '../../src/types';

let mockVehicles: Vehicle[] = [];

export const setMockVehicles = (vehicles: Vehicle[]) => {
  mockVehicles = [...vehicles];
};

export const readVehicles = async (): Promise<Vehicle[]> => {
  return Promise.resolve(mockVehicles);
};

export const writeVehicles = async (vehicles: Vehicle[]): Promise<void> => {
  mockVehicles = [...vehicles];
  return Promise.resolve();
};

export const generateId = (vehicles: Vehicle[]): string => {
  const maxId = vehicles.reduce((max, vehicle) => Math.max(max, parseInt(vehicle.id, 10)), 0);
  return (maxId + 1).toString();
};
