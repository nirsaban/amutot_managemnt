import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { ok } from "../common/http/api-response";
import { AuthorizationService } from "../authz/authorization.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("families")
export class FamiliesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthorizationService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(":familyId")
  async updateFamily(
    @CurrentUser() user: AuthUser,
    @Param("familyId") familyId: string,
    @Body() _body: { name?: string }
  ) {
    // NOTE: placeholder business logic; authorization is real.
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { systemRole: true }
    });

    if (dbUser?.systemRole === "ADMIN") {
      return ok({ updated: true });
    }

    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      select: { distributionGroupId: true, deletedAt: true }
    });
    if (!family || family.deletedAt) {
      this.authz.forbid("Family not found", "FAMILY_NOT_FOUND");
    }
    if (!family.distributionGroupId) {
      this.authz.forbid("Only admin can update ungrouped families", "FAMILY_UPDATE_FORBIDDEN");
    }

    await this.authz.assertGroupManager(
      { ...user, systemRole: dbUser?.systemRole },
      family!.distributionGroupId!
    );

    return ok({ updated: true });
  }
}
