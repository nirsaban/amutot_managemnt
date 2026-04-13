import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ok } from "../common/http/api-response";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { CompleteProfileDto } from "./dto/complete-profile.dto";
import { SelectGroupDto } from "./dto/select-group.dto";
import { OnboardingService } from "./onboarding.service";

@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post("complete-profile")
  async completeProfile(@CurrentUser() user: AuthUser, @Body() dto: CompleteProfileDto) {
    return ok(await this.onboarding.completeProfile(user.userId, dto));
  }

  @Post("select-group")
  async selectGroup(@CurrentUser() user: AuthUser, @Body() dto: SelectGroupDto) {
    const groupId = dto.groupId ?? null;
    return ok(await this.onboarding.selectGroup(user.userId, user.associationId, groupId));
  }
}

