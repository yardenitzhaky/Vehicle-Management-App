import { Vehicle } from '@shared/index';

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
      `"${vehicle.licensePlate}"`, 
      vehicle.status,
      `"${vehicle.createdAt}"`, 
    ].join(',');
  });

  // Combine headers and data
  return [headerRow, ...dataRows].join('\n');
};


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
