export type UserRole = "Member" | "Approver" | "Admin";

export type Permission = "read" | "propose" | "review" | "admin";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Member: ["read", "propose"],
  Approver: ["read", "propose", "review"],
  Admin: ["read", "propose", "review", "admin"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canPropose(role: UserRole): boolean {
  return hasPermission(role, "propose");
}

export function canReview(role: UserRole): boolean {
  return hasPermission(role, "review");
}

export function canAdmin(role: UserRole): boolean {
  return hasPermission(role, "admin");
}

export function getNavItems(role: UserRole | null): { propose: boolean; review: boolean; admin: boolean } {
  if (!role) return { propose: false, review: false, admin: false };
  return {
    propose: canPropose(role),
    review: canReview(role),
    admin: canAdmin(role),
  };
}
