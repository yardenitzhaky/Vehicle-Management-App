// Re-export all shared validations
export {
  MAINTENANCE_LIMIT_PERCENTAGE,
  canDeleteVehicle,
  canSetToMaintenance,
  validateLicensePlate,
  isLicensePlateUnique,
  canTransitionStatus,
  validateCreateVehicle,
  validateUpdateVehicle,
} from '../../types/validations.ts';