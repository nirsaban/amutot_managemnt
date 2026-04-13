import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { ok } from "../common/http/api-response";
import { WeeklyDistributorContextPolicy } from "../authz/policies/weekly-distributor-context.policy";

@Controller("weekly-distributors")
export class WeeklyDistributorsController {
  constructor(private readonly weeklyDistributor: WeeklyDistributorContextPolicy) {}

  // Delivery-relevant view for current week (stub).
  @UseGuards(JwtAuthGuard)
  @Get(":groupId/:weekKey/manifest")
  async manifest(
    @CurrentUser() user: AuthUser,
    @Param("groupId") groupId: string,
    @Param("weekKey") weekKey: string
  ) {
    await this.weeklyDistributor.assert(user, groupId, weekKey);
    return ok({ groupId, weekKey, deliveries: [] });
  }
}
