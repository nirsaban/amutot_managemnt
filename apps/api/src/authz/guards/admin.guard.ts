import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../../auth/auth.types";
import { AuthorizationService } from "../authorization.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthorizationService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<any>();
    const user = req.user as AuthUser;
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { systemRole: true, deletedAt: true, isActive: true }
    });
    if (!dbUser || dbUser.deletedAt || !dbUser.isActive) {
      this.authz.forbid("User not active", "USER_INACTIVE");
    }
    this.authz.assertAdmin({ ...user, systemRole: dbUser!.systemRole });
    return true;
  }
}
