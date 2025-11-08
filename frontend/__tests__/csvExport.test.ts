/**
 * Tests for CSV Export Functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { convertToCSV, exportToCSV, generateTimestampedFilename } from '@/lib/csvExport';
import { Vehicle } from '@shared/index';

describe('CSV Export Utility', () => {
  describe('convertToCSV', () => {
    it('should convert vehicles array to CSV format', () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          licensePlate: 'XYZ-789',
          status: 'InUse',
          createdAt: '2024-01-16T14:45:00Z',
        },
      ];

      const csv = convertToCSV(vehicles);

      expect(csv).toContain('id,licensePlate,status,createdAt');
      expect(csv).toContain('1,"ABC-123",Available,"2024-01-15T10:30:00Z"');
      expect(csv).toContain('2,"XYZ-789",InUse,"2024-01-16T14:45:00Z"');
    });

    it('should return only headers for empty array', () => {
      const csv = convertToCSV([]);

      expect(csv).toBe('id,licensePlate,status,createdAt\n');
    });

    it('should handle special characters in license plate', () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC,123',
          status: 'Available',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ];

      const csv = convertToCSV(vehicles);

      // License plate should be wrapped in quotes
      expect(csv).toContain('"ABC,123"');
    });

    it('should handle all status types', () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          licensePlate: 'DEF-456',
          status: 'InUse',
          createdAt: '2024-01-16T10:30:00Z',
        },
        {
          id: '3',
          licensePlate: 'GHI-789',
          status: 'Maintenance',
          createdAt: '2024-01-17T10:30:00Z',
        },
      ];

      const csv = convertToCSV(vehicles);

      expect(csv).toContain('Available');
      expect(csv).toContain('InUse');
      expect(csv).toContain('Maintenance');
    });
  });

  describe('exportToCSV', () => {
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;
    let clickSpy: any;

    beforeEach(() => {
      // Mock URL methods
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock DOM elements and methods
      clickSpy = vi.fn();
      const mockLink = {
        setAttribute: vi.fn(),
        style: {},
        click: clickSpy,
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create and trigger download with default filename', () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ];

      exportToCSV(vehicles);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should use custom filename when provided', () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          licensePlate: 'ABC-123',
          status: 'Available',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ];

      exportToCSV(vehicles, 'custom-export.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('generateTimestampedFilename', () => {
    it('should generate filename with timestamp', () => {
      const filename = generateTimestampedFilename();

      expect(filename).toMatch(/^vehicles-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/);
    });

    it('should generate unique filenames when called multiple times', () => {
      const filename1 = generateTimestampedFilename();

      // Small delay to ensure different timestamp
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait for at least 10ms
      }

      const filename2 = generateTimestampedFilename();

      // Filenames might be the same if called in the same second
      // But the format should be correct
      expect(filename1).toMatch(/^vehicles-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/);
      expect(filename2).toMatch(/^vehicles-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/);
    });

    it('should have correct format', () => {
      const filename = generateTimestampedFilename();

      expect(filename).toContain('vehicles-');
      expect(filename).toContain('.csv');
    });
  });
});
