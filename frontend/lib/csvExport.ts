/**
 * CSV Export Utility
 * Provides functionality to export vehicle data to CSV format
 */

import { Vehicle } from '@shared/index';

/**
 * Converts an array of vehicles to CSV format
 * @param vehicles - Array of vehicle objects to convert
 * @returns CSV string with headers and data
 */
export const convertToCSV = (vehicles: Vehicle[]): string => {
  if (vehicles.length === 0) {
    return 'id,licensePlate,status,createdAt\n';
  }

  // CSV Headers
  const headers = ['id', 'licensePlate', 'status', 'createdAt'];
  const headerRow = headers.join(',');

  // CSV Data Rows
  const dataRows = vehicles.map((vehicle) => {
    return [
      vehicle.id,
      `"${vehicle.licensePlate}"`, // Wrap in quotes to handle special characters
      vehicle.status,
      `"${vehicle.createdAt}"`, // Wrap in quotes for date format
    ].join(',');
  });

  // Combine headers and data
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Exports vehicles data as a downloadable CSV file
 * @param vehicles - Array of vehicle objects to export
 * @param filename - Optional custom filename (default: 'vehicles-export.csv')
 */
export const exportToCSV = (
  vehicles: Vehicle[],
  filename: string = 'vehicles-export.csv'
): void => {
  // Convert to CSV
  const csvContent = convertToCSV(vehicles);

  // Create a Blob from the CSV string
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Generates a filename with current timestamp
 * @returns Filename string with format: vehicles-YYYY-MM-DD-HHmmss.csv
 */
export const generateTimestampedFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `vehicles-${year}-${month}-${day}-${hours}${minutes}${seconds}.csv`;
};
