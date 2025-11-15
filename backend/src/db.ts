import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Vehicle } from '@shared/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Generate unique ID(s) for new vehicle(s)
 * @param vehicles - Existing vehicles array
 * @param count - Number of IDs to generate (defaults to 1)
 * @returns Single ID string if count is 1, otherwise array of ID strings
 */
export function generateIds(
  vehicles: Vehicle[],
  count: number = 1
): string | string[] {
  const maxId = vehicles.reduce((max, vehicle) => {
    const id = parseInt(vehicle.id, 10);
    return !isNaN(id) && id > max ? id : max;
  }, 0);

  if (count === 1) {
    return (maxId + 1).toString();
  }

  const ids: string[] = [];
  for (let i = 1; i <= count; i++) {
    ids.push((maxId + i).toString());
  }
  return ids;
}
