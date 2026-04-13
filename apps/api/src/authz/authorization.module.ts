import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import { AdminGuard } from "./guards/admin.guard";
import { GroupContextPolicy } from "./policies/group-context.policy";
import { GroupManagerPolicy } from "./policies/group-manager.policy";
import { SelfOrAdminPolicy } from "./policies/self-or-admin.policy";
import { WeeklyDistributorContextPolicy } from "./policies/weekly-distributor-context.policy";

@Module({
  providers: [
    AuthorizationService,
    AdminGuard,
    SelfOrAdminPolicy,
    GroupContextPolicy,
    GroupManagerPolicy,
    WeeklyDistributorContextPolicy
  ],
  exports: [
    AuthorizationService,
    AdminGuard,
    SelfOrAdminPolicy,
    GroupContextPolicy,
    GroupManagerPolicy,
    WeeklyDistributorContextPolicy
  ]
})
export class AuthorizationModule {}

