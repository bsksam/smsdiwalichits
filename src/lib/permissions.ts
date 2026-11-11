export type UserRole = "super_admin" | "admin" | "manager" | "cashier" | "collection_agent" | "viewer";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "dashboard:view",
    "customers:view", "customers:create", "customers:edit", "customers:delete",
    "schemes:view", "schemes:create", "schemes:edit",
    "installments:view", "installments:manage",
    "payments:view", "payments:collect", "payments:reverse",
    "groceries:view", "groceries:manage",
    "packages:view", "packages:manage",
    "redemptions:view", "redemptions:process",
    "poster:manage",
    "expenses:view", "expenses:manage",
    "staff:view", "staff:manage",
    "branches:view", "branches:manage",
    "reports:view", "reports:export",
    "settings:manage",
  ],
  manager: [
    "dashboard:view",
    "customers:view", "customers:create", "customers:edit",
    "schemes:view",
    "installments:view",
    "payments:view", "payments:collect",
    "groceries:view", "groceries:manage",
    "packages:view", "packages:manage",
    "redemptions:view", "redemptions:process",
    "poster:manage",
    "expenses:view", "expenses:manage",
    "reports:view", "reports:export",
  ],
  cashier: [
    "dashboard:view",
    "customers:view", "customers:create", "customers:edit",
    "schemes:view",
    "installments:view",
    "payments:view", "payments:collect",
    "groceries:view",
    "packages:view",
    "redemptions:view", "redemptions:process",
    "reports:view",
  ],
  collection_agent: [
    "dashboard:view",
    "customers:view", "customers:create",
    "schemes:view",
    "installments:view",
    "payments:view", "payments:collect",
  ],
  viewer: [
    "dashboard:view",
    "customers:view",
    "schemes:view",
    "groceries:view",
    "reports:view",
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}
