import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../../auth/auth.types";
import { AuthorizationService } from "../authorization.service";

@Injectable()
export class GroupManagerPolicy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthorizationService
  ) {}

  async assert(user: AuthUser, groupId: string) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { systemRole: true }
    });
    await this.authz.assertGroupManager({ ...user, systemRole: dbUser?.systemRole }, groupId);
  }
}

