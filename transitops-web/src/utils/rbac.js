// ===========================================================================
// PERMISSIONS – maps action keys to the roles that may perform them
// ===========================================================================
export const PERMISSIONS = {
  manage_vehicles:   ['FLEET_MANAGER'],
  manage_drivers:    ['FLEET_MANAGER'],
  suspend_driver:    ['FLEET_MANAGER', 'SAFETY_OFFICER'],
  manage_trips:      ['FLEET_MANAGER', 'DRIVER'],
  manage_maintenance:['FLEET_MANAGER'],
  log_fuel_expense:  ['FLEET_MANAGER', 'DRIVER'],
  view_reports:      ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  view_dashboard:    ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
};

// ===========================================================================
// Helpers
// ===========================================================================

/**
 * Returns `true` if the given role is allowed to perform `action`.
 * @param {string} role   – e.g. 'FLEET_MANAGER'
 * @param {string} action – key in PERMISSIONS, e.g. 'manage_vehicles'
 */
export function hasPermission(role, action) {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
}

/**
 * Alias for `hasPermission` – provided for semantic clarity when guarding
 * routes or UI sections.
 */
export const canAccess = hasPermission;

// ===========================================================================
// NAV_ITEMS – used by the sidebar / navigation to render links
// ===========================================================================
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    requiredPermission: 'view_dashboard',
  },
  {
    label: 'Vehicles',
    path: '/vehicles',
    icon: 'Truck',
    requiredPermission: 'manage_vehicles',
  },
  {
    label: 'Drivers',
    path: '/drivers',
    icon: 'Users',
    requiredPermission: 'manage_drivers',
  },
  {
    label: 'Trips',
    path: '/trips',
    icon: 'MapPin',
    requiredPermission: 'manage_trips',
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: 'Wrench',
    requiredPermission: 'manage_maintenance',
  },
  {
    label: 'Fuel & Expenses',
    path: '/expenses',
    icon: 'DollarSign',
    requiredPermission: 'log_fuel_expense',
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    requiredPermission: 'view_reports',
  },
];
