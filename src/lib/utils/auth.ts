/**
 * Check if a user role is ADMIN
 */
export const isAdmin = (role?: string): boolean => {
  return role === "ADMIN";
};

/**
 * Check if a user has write access (not an admin)
 */
export const hasWriteAccess = (role?: string): boolean => {
  return !isAdmin(role);
};
