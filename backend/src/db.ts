import fs from 'fs/promises';
import path from 'path';
import { Vehicle } from './types';

const DATA_FILE = path.join(__dirname, '../data/vehicles.json');

/**
 * Read all vehicles from the JSON file
 */
export async function readVehicles(): Promise<Vehicle[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading vehicles:', error);
    return [];
  }
}

/**
 * Write vehicles to the JSON file
 */
export async function writeVehicles(vehicles: Vehicle[]): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(vehicles, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing vehicles:', error);
    throw new Error('Failed to save vehicles');
  }
}

/**
 * Generate a unique ID for a new vehicle
 */
export function generateId(vehicles: Vehicle[]): string {
  const maxId = vehicles.reduce((max, vehicle) => {
    const id = parseInt(vehicle.id, 10);
    return id > max ? id : max;
  }, 0);
  return (maxId + 1).toString();
}
