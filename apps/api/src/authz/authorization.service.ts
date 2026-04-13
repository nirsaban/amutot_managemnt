import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/auth.types";
import { AssignmentStatus, GroupRole, UserSystemRole } from "@prisma/client";

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(user: AuthUser & { systemRole?: UserSystemRole }) {
    return user.systemRole === UserSystemRole.ADMIN;
  }

  isSelf(user: AuthUser, targetUserId: string) {
    return user.userId === targetUserId;
  }

  async isGroupManager(userId: string, groupId: string) {
    const group = await this.prisma.distributionGroup.findFirst({
      where: { id: groupId, deletedAt: null },
      select: { managerUserId: true }
    });
    return !!group && group.managerUserId === userId;
  }

  async isGroupMember(userId: string, groupId: string) {
    const membership = await this.prisma.groupMembership.findFirst({
      where: {
        groupId,
        userId,
        deletedAt: null,
        endedAt: null,
        role: GroupRole.MEMBER
      },
      select: { id: true }
    });
    return !!membership;
  }

  async isWeeklyDistributor(userId: string, groupId: string, weekKey: string) {
    const assignment = await this.prisma.weeklyDistributorAssignment.findFirst({
      where: {
        groupId,
        weekKey,
        distributorUserId: userId,
        deletedAt: null,
        status: { in: [AssignmentStatus.ASSIGNED, AssignmentStatus.CONFIRMED] }
      },
      select: { id: true }
    });
    return !!assignment;
  }

  forbid(message: string, code = "FORBIDDEN"): never {
    throw new ForbiddenException({ code, message });
  }

  assertAdmin(user: AuthUser & { systemRole?: UserSystemRole }) {
    if (!this.isAdmin(user)) {
      this.forbid("Admin access required", "ADMIN_REQUIRED");
    }
  }

  assertSelfOrAdmin(user: AuthUser & { systemRole?: UserSystemRole }, targetUserId: string) {
    if (this.isAdmin(user) || this.isSelf(user, targetUserId)) return;
    this.forbid("Access allowed only to self or admin", "SELF_OR_ADMIN_REQUIRED");
  }

  async assertGroupContext(user: AuthUser & { systemRole?: UserSystemRole }, groupId: string) {
    if (this.isAdmin(user)) return;
    const [isManager, isMember] = await Promise.all([
      this.isGroupManager(user.userId, groupId),
      this.isGroupMember(user.userId, groupId)
    ]);
    if (isManager || isMember) return;
    this.forbid("User is not in this group context", "GROUP_CONTEXT_REQUIRED");
  }

  async assertGroupManager(user: AuthUser & { systemRole?: UserSystemRole }, groupId: string) {
    if (this.isAdmin(user)) return;
    const allowed = await this.isGroupManager(user.userId, groupId);
    if (!allowed) {
      this.forbid("Group manager access required", "GROUP_MANAGER_REQUIRED");
    }
  }

  async assertWeeklyDistributorContext(
    user: AuthUser & { systemRole?: UserSystemRole },
    groupId: string,
    weekKey: string
  ) {
    if (this.isAdmin(user)) return;
    const allowed = await this.isWeeklyDistributor(user.userId, groupId, weekKey);
    if (!allowed) {
      this.forbid("Weekly distributor access required", "WEEKLY_DISTRIBUTOR_REQUIRED");
    }
  }
}
