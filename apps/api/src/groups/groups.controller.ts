import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ok } from "../common/http/api-response";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { GroupsService } from "./groups.service";
import { GroupContextPolicy } from "../authz/policies/group-context.policy";

@Controller("groups")
export class GroupsController {
  constructor(
    private readonly groups: GroupsService,
    private readonly groupContext: GroupContextPolicy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return ok(await this.groups.list(user.associationId));
  }

  @UseGuards(JwtAuthGuard)
  @Get(":groupId")
  async getOne(@CurrentUser() user: AuthUser, @Param("groupId") groupId: string) {
    await this.groupContext.assert(user, groupId);
    return ok({ id: groupId });
  }
}
