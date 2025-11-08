import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge Component', () => {
  it('should render Available status correctly', () => {
    render(<StatusBadge status="Available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should render InUse status correctly', () => {
    render(<StatusBadge status="InUse" />);
    expect(screen.getByText('In Use')).toBeInTheDocument();
  });

  it('should render Maintenance status correctly', () => {
    render(<StatusBadge status="Maintenance" />);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('should apply correct styling for Available status', () => {
    render(<StatusBadge status="Available" />);
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should apply correct styling for InUse status', () => {
    render(<StatusBadge status="InUse" />);
    const badge = screen.getByText('In Use');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should apply correct styling for Maintenance status', () => {
    render(<StatusBadge status="Maintenance" />);
    const badge = screen.getByText('Maintenance');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });
});
