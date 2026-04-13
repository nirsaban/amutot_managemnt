import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { AppConfigModule } from "./config/config.module";
import { FamiliesModule } from "./families/families.module";
import { GroupsModule } from "./groups/groups.module";
import { MembershipsModule } from "./memberships/memberships.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { PaymentsModule } from "./payments/payments.module";
import { PaymentStatusModule } from "./payment-status/payment-status.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RemindersModule } from "./reminders/reminders.module";
import { UsersModule } from "./users/users.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { WeeklyDistributorsModule } from "./weekly-distributors/weekly-distributors.module";
import { WeeklyOrdersModule } from "./weekly-orders/weekly-orders.module";
import { AuthorizationModule } from "./authz/authorization.module";

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthorizationModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    MembershipsModule,
    FamiliesModule,
    WeeklyOrdersModule,
    WeeklyDistributorsModule,
    PaymentsModule,
    PaymentStatusModule,
    RemindersModule,
    NotificationsModule,
    WebhooksModule,
    AdminModule,
    OnboardingModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
