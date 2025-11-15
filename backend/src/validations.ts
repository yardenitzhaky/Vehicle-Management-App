// Re-export all shared validations
export {
  MAINTENANCE_LIMIT_PERCENTAGE,
  canDeleteVehicle,
  canSetToMaintenance,
  validateLicensePlate,
  isLicensePlateUnique,
  canTransitionStatus,
  validateCreateVehicles,
  validateUpdateVehicle,
} from '../../types/validations';