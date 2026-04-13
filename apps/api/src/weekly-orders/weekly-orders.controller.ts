import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { ok } from "../common/http/api-response";
import { GroupManagerPolicy } from "../authz/policies/group-manager.policy";

@Controller("weekly-orders")
export class WeeklyOrdersController {
  constructor(private readonly groupManager: GroupManagerPolicy) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: { groupId: string; familyId: string; weekKey: string }) {
    await this.groupManager.assert(user, body.groupId);
    return ok({ created: true });
  }
}
