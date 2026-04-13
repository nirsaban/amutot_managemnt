-- Enable UUID generation used by `@default(uuid())`
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE "UserSystemRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "GroupRole" AS ENUM ('MEMBER');
CREATE TYPE "WeeklyOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CANCELLED', 'FULFILLED');
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'WEBHOOK');
CREATE TYPE "MonthlyStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED');
CREATE TYPE "ReminderChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'PUSH');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_REMINDER', 'ORDER_REMINDER', 'GENERAL');

-- Tables
CREATE TABLE "Association" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Family" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "distributionGroupId" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "phone" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "systemRole" "UserSystemRole" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "importedAt" TIMESTAMPTZ,
  "familyId" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DistributionGroup" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "managerUserId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "DistributionGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupMembership" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "groupId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "endedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeeklyOrder" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "familyId" UUID NOT NULL,
  "weekKey" TEXT NOT NULL,
  "status" "WeeklyOrderStatus" NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "WeeklyOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeeklyDistributorAssignment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "groupId" UUID NOT NULL,
  "weekKey" TEXT NOT NULL,
  "distributorUserId" UUID NOT NULL,
  "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "WeeklyDistributorAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ILS',
  "monthKey" TEXT,
  "externalTransactionId" TEXT,
  "paidAt" TIMESTAMPTZ,
  "rawWebhook" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonthlyPaymentStatus" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "monthKey" TEXT NOT NULL,
  "status" "MonthlyStatus" NOT NULL DEFAULT 'UNPAID',
  "paidAt" TIMESTAMPTZ,
  "paymentId" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "MonthlyPaymentStatus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentReminder" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "monthKey" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "channel" "ReminderChannel" NOT NULL,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "userId" UUID,
  "type" "NotificationType" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT,
  "body" TEXT,
  "data" JSONB,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PushSubscription" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "associationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "userAgent" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- Uniques
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "GroupMembership_groupId_userId_key" ON "GroupMembership"("groupId", "userId");
CREATE UNIQUE INDEX "WeeklyOrder_familyId_weekKey_key" ON "WeeklyOrder"("familyId", "weekKey");
CREATE UNIQUE INDEX "WeeklyDistributorAssignment_groupId_weekKey_key" ON "WeeklyDistributorAssignment"("groupId", "weekKey");
CREATE UNIQUE INDEX "MonthlyPaymentStatus_userId_monthKey_key" ON "MonthlyPaymentStatus"("userId", "monthKey");
CREATE UNIQUE INDEX "MonthlyPaymentStatus_paymentId_key" ON "MonthlyPaymentStatus"("paymentId");
CREATE UNIQUE INDEX "Payment_externalTransactionId_key" ON "Payment"("externalTransactionId");
CREATE UNIQUE INDEX "PaymentReminder_userId_monthKey_sequence_key" ON "PaymentReminder"("userId", "monthKey", "sequence");
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- Indexes (query patterns / requirements)
CREATE INDEX "User_associationId_idx" ON "User"("associationId");
CREATE INDEX "User_familyId_idx" ON "User"("familyId");
CREATE INDEX "DistributionGroup_associationId_idx" ON "DistributionGroup"("associationId");
CREATE INDEX "DistributionGroup_managerUserId_idx" ON "DistributionGroup"("managerUserId");
CREATE INDEX "Family_associationId_idx" ON "Family"("associationId");
CREATE INDEX "Family_distributionGroupId_idx" ON "Family"("distributionGroupId");
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");
CREATE INDEX "GroupMembership_userId_idx" ON "GroupMembership"("userId");
CREATE INDEX "GroupMembership_role_idx" ON "GroupMembership"("role");
CREATE INDEX "WeeklyOrder_associationId_idx" ON "WeeklyOrder"("associationId");
CREATE INDEX "WeeklyOrder_familyId_idx" ON "WeeklyOrder"("familyId");
CREATE INDEX "WeeklyOrder_weekKey_idx" ON "WeeklyOrder"("weekKey");
CREATE INDEX "WeeklyOrder_status_idx" ON "WeeklyOrder"("status");
CREATE INDEX "WeeklyDistributorAssignment_associationId_idx" ON "WeeklyDistributorAssignment"("associationId");
CREATE INDEX "WeeklyDistributorAssignment_groupId_idx" ON "WeeklyDistributorAssignment"("groupId");
CREATE INDEX "WeeklyDistributorAssignment_weekKey_idx" ON "WeeklyDistributorAssignment"("weekKey");
CREATE INDEX "WeeklyDistributorAssignment_distributorUserId_idx" ON "WeeklyDistributorAssignment"("distributorUserId");
CREATE INDEX "WeeklyDistributorAssignment_status_idx" ON "WeeklyDistributorAssignment"("status");
CREATE INDEX "Payment_associationId_idx" ON "Payment"("associationId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_monthKey_idx" ON "Payment"("monthKey");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "MonthlyPaymentStatus_associationId_idx" ON "MonthlyPaymentStatus"("associationId");
CREATE INDEX "MonthlyPaymentStatus_userId_idx" ON "MonthlyPaymentStatus"("userId");
CREATE INDEX "MonthlyPaymentStatus_monthKey_idx" ON "MonthlyPaymentStatus"("monthKey");
CREATE INDEX "MonthlyPaymentStatus_status_idx" ON "MonthlyPaymentStatus"("status");
CREATE INDEX "PaymentReminder_associationId_idx" ON "PaymentReminder"("associationId");
CREATE INDEX "PaymentReminder_userId_idx" ON "PaymentReminder"("userId");
CREATE INDEX "PaymentReminder_monthKey_idx" ON "PaymentReminder"("monthKey");
CREATE INDEX "Notification_associationId_idx" ON "Notification"("associationId");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_status_idx" ON "Notification"("status");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
CREATE INDEX "PushSubscription_associationId_idx" ON "PushSubscription"("associationId");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
CREATE INDEX "PushSubscription_isActive_idx" ON "PushSubscription"("isActive");

-- Soft-delete helper indexes
CREATE INDEX "Association_deletedAt_idx" ON "Association"("deletedAt");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "DistributionGroup_deletedAt_idx" ON "DistributionGroup"("deletedAt");
CREATE INDEX "Family_deletedAt_idx" ON "Family"("deletedAt");
CREATE INDEX "GroupMembership_deletedAt_idx" ON "GroupMembership"("deletedAt");
CREATE INDEX "WeeklyOrder_deletedAt_idx" ON "WeeklyOrder"("deletedAt");
CREATE INDEX "WeeklyDistributorAssignment_deletedAt_idx" ON "WeeklyDistributorAssignment"("deletedAt");
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");
CREATE INDEX "PaymentReminder_deletedAt_idx" ON "PaymentReminder"("deletedAt");
CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");
CREATE INDEX "PushSubscription_deletedAt_idx" ON "PushSubscription"("deletedAt");

-- Foreign keys
ALTER TABLE "Family"
  ADD CONSTRAINT "Family_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User"
  ADD CONSTRAINT "User_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DistributionGroup"
  ADD CONSTRAINT "DistributionGroup_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "DistributionGroup_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Family"
  ADD CONSTRAINT "Family_distributionGroupId_fkey" FOREIGN KEY ("distributionGroupId") REFERENCES "DistributionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GroupMembership"
  ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DistributionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WeeklyOrder"
  ADD CONSTRAINT "WeeklyOrder_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "WeeklyOrder_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WeeklyDistributorAssignment"
  ADD CONSTRAINT "WeeklyDistributorAssignment_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "WeeklyDistributorAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DistributionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "WeeklyDistributorAssignment_distributorUserId_fkey" FOREIGN KEY ("distributorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MonthlyPaymentStatus"
  ADD CONSTRAINT "MonthlyPaymentStatus_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "MonthlyPaymentStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "MonthlyPaymentStatus_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentReminder"
  ADD CONSTRAINT "PaymentReminder_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PaymentReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PushSubscription"
  ADD CONSTRAINT "PushSubscription_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

