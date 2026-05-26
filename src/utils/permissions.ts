import { Role, Permission, ROLE_PERMISSIONS } from '../types/roles';

/**
 * Returns the primary role from the user's roles array.
 * Admin > Staff > Customer (highest privilege wins).
 */
export const getPrimaryRole = (roles?: string[]): Role => {
  if (!roles || roles.length === 0) return 'ROLE_CUSTOMER';
  if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
  if (roles.includes('ROLE_STAFF')) return 'ROLE_STAFF';
  return 'ROLE_CUSTOMER';
};

/**
 * Check if a role has a specific permission.
 */
export const canAccess = (roles: string[] | undefined, permission: Permission): boolean => {
  const primary = getPrimaryRole(roles);
  return ROLE_PERMISSIONS[primary]?.includes(permission) ?? false;
};

/**
 * Convenience booleans — import what you need in each screen.
 */
export const isAdmin  = (roles?: string[]) => getPrimaryRole(roles) === 'ROLE_ADMIN';
export const isStaff  = (roles?: string[]) => ['ROLE_ADMIN', 'ROLE_STAFF'].includes(getPrimaryRole(roles));
export const isCustomer = (roles?: string[]) => getPrimaryRole(roles) === 'ROLE_CUSTOMER';