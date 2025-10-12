// Authentication utility functions

export const ROLES = {
  USER: 'user',
  VENDOR: 'vendor',
  MECHANIC: 'mechanic',
  ADMIN: 'admin'
};

// Check if user is authenticated
export const isAuthenticated = (user) => {
  return user && user.token && user.email;
};

// Check if user has any of the required roles
export const hasAnyRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;
  return requiredRoles.includes(user.role);
};

// Check if user has specific role
export const hasRole = (user, role) => {
  return user && user.role === role;
};

// Check if user is admin
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

// Check if user is vendor
export const isVendor = (user) => {
  return hasRole(user, ROLES.VENDOR);
};

// Check if user is mechanic
export const isMechanic = (user) => {
  return hasRole(user, ROLES.MECHANIC);
};

// Check if user is regular user
export const isUser = (user) => {
  return hasRole(user, ROLES.USER);
};

// Check if vendor is approved
export const isVendorApproved = (user) => {
  return isVendor(user) && user.isApproved;
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.USER]: 'Customer',
    [ROLES.VENDOR]: 'Vendor',
    [ROLES.MECHANIC]: 'Mechanic',
    [ROLES.ADMIN]: 'Administrator'
  };
  return roleNames[role] || role;
};

// Get role-based dashboard path
export const getDashboardPath = (role) => {
  const paths = {
    [ROLES.USER]: '/dashboard',
    [ROLES.VENDOR]: '/vendor',
    [ROLES.MECHANIC]: '/mechanic/dashboard',
    [ROLES.ADMIN]: '/admin'
  };
  return paths[role] || '/dashboard';
};

// Check if user can access resource
export const canAccess = (user, resource, action = 'read') => {
  if (!user) return false;
  
  // Admin can access everything
  if (isAdmin(user)) return true;
  
  // Role-based permissions
  const permissions = {
    [ROLES.USER]: ['vehicles', 'mechanics', 'bookings'],
    [ROLES.VENDOR]: ['vehicles', 'bookings', 'mechanics', 'earnings'],
    [ROLES.MECHANIC]: ['bookings', 'availability', 'reviews']
  };
  
  return permissions[user.role]?.includes(resource) || false;
};

// Get user permissions
export const getUserPermissions = (user) => {
  if (!user) return [];
  
  const permissions = {
    [ROLES.USER]: [
      'view_vehicles',
      'book_vehicles',
      'view_mechanics',
      'contact_mechanics',
      'view_bookings',
      'cancel_bookings'
    ],
    [ROLES.VENDOR]: [
      'manage_vehicles',
      'view_bookings',
      'manage_bookings',
      'view_earnings',
      'manage_mechanics',
      'view_analytics'
    ],
    [ROLES.MECHANIC]: [
      'view_assigned_bookings',
      'update_availability',
      'view_reviews',
      'contact_customers'
    ],
    [ROLES.ADMIN]: [
      'manage_users',
      'manage_vehicles',
      'manage_bookings',
      'view_analytics',
      'system_settings',
      'approve_vendors'
    ]
  };
  
  return permissions[user.role] || [];
};