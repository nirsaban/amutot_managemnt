import type { AuthUser } from "../auth/auth.types";
import type { UserSystemRole } from "@prisma/client";

export function isAdmin(user: AuthUser & { systemRole?: UserSystemRole }) {
  return user.systemRole === "ADMIN";
}

export function isSelf(user: AuthUser, targetUserId: string) {
  return user.userId === targetUserId;
}

