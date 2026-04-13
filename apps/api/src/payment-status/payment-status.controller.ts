import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { ok } from "../common/http/api-response";
import { GroupManagerPolicy } from "../authz/policies/group-manager.policy";
import { PrismaService } from "../prisma/prisma.service";

@Controller("payment-status")
export class PaymentStatusController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupManager: GroupManagerPolicy
  ) {}

  // Manager can see paid/unpaid inside own group only (no payment amounts).
  @UseGuards(JwtAuthGuard)
  @Get("group/:groupId/:monthKey")
  async groupMonthStatus(
    @CurrentUser() user: AuthUser,
    @Param("groupId") groupId: string,
    @Param("monthKey") monthKey: string
  ) {
    await this.groupManager.assert(user, groupId);

    const members = await this.prisma.groupMembership.findMany({
      where: { groupId, deletedAt: null, endedAt: null },
      select: { userId: true }
    });
    const userIds = members.map((m) => m.userId);

    const statuses = await this.prisma.monthlyPaymentStatus.findMany({
      where: { userId: { in: userIds }, monthKey },
      select: { userId: true, status: true, paidAt: true }
    });

    return ok({ groupId, monthKey, statuses });
  }
}
