-- CreateEnum
CREATE TYPE "UserSystemRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('MEMBER');

-- CreateEnum
CREATE TYPE "WeeklyOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CANCELLED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "MonthlyStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_REMINDER', 'ORDER_REMINDER', 'GENERAL');

-- CreateTable
CREATE TABLE "Association" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "systemRole" "UserSystemRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "importedAt" TIMESTAMP(3),
    "registrationCompleted" BOOLEAN NOT NULL DEFAULT false,
    "groupSelectionCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "familyId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionGroup" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "managerUserId" UUID NOT NULL,

    CONSTRAINT "DistributionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "distributionGroupId" UUID,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyOrder" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "weekKey" TEXT NOT NULL,
    "status" "WeeklyOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyDistributorAssignment" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "weekKey" TEXT NOT NULL,
    "distributorUserId" UUID NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyDistributorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "monthKey" TEXT,
    "externalTransactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "rawWebhook" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyPaymentStatus" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "monthKey" TEXT NOT NULL,
    "status" "MonthlyStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "paymentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPaymentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReminder" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "monthKey" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "userId" UUID,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "body" TEXT,
    "data" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" UUID NOT NULL,
    "associationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Association_deletedAt_idx" ON "Association"("deletedAt");

-- CreateIndex
CREATE INDEX "User_associationId_idx" ON "User"("associationId");

-- CreateIndex
CREATE INDEX "User_familyId_idx" ON "User"("familyId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_registrationCompleted_idx" ON "User"("registrationCompleted");

-- CreateIndex
CREATE INDEX "User_groupSelectionCompleted_idx" ON "User"("groupSelectionCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "DistributionGroup_associationId_idx" ON "DistributionGroup"("associationId");

-- CreateIndex
CREATE INDEX "DistributionGroup_managerUserId_idx" ON "DistributionGroup"("managerUserId");

-- CreateIndex
CREATE INDEX "DistributionGroup_deletedAt_idx" ON "DistributionGroup"("deletedAt");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_userId_idx" ON "GroupMembership"("userId");

-- CreateIndex
CREATE INDEX "GroupMembership_role_idx" ON "GroupMembership"("role");

-- CreateIndex
CREATE INDEX "GroupMembership_deletedAt_idx" ON "GroupMembership"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_groupId_userId_key" ON "GroupMembership"("groupId", "userId");

-- CreateIndex
CREATE INDEX "Family_associationId_idx" ON "Family"("associationId");

-- CreateIndex
CREATE INDEX "Family_distributionGroupId_idx" ON "Family"("distributionGroupId");

-- CreateIndex
CREATE INDEX "Family_deletedAt_idx" ON "Family"("deletedAt");

-- CreateIndex
CREATE INDEX "WeeklyOrder_associationId_idx" ON "WeeklyOrder"("associationId");

-- CreateIndex
CREATE INDEX "WeeklyOrder_familyId_idx" ON "WeeklyOrder"("familyId");

-- CreateIndex
CREATE INDEX "WeeklyOrder_weekKey_idx" ON "WeeklyOrder"("weekKey");

-- CreateIndex
CREATE INDEX "WeeklyOrder_status_idx" ON "WeeklyOrder"("status");

-- CreateIndex
CREATE INDEX "WeeklyOrder_deletedAt_idx" ON "WeeklyOrder"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyOrder_familyId_weekKey_key" ON "WeeklyOrder"("familyId", "weekKey");

-- CreateIndex
CREATE INDEX "WeeklyDistributorAssignment_associationId_idx" ON "WeeklyDistributorAssignment"("associationId");

-- CreateIndex
CREATE INDEX "WeeklyDistributorAssignment_groupId_idx" ON "WeeklyDistributorAssignment"("groupId");

-- CreateIndex
CREATE INDEX "WeeklyDistributorAssignment_weekKey_idx" ON "WeeklyDistributorAssignment"("weekKey");

-- CreateIndex
CREATE INDEX "WeeklyDistributorAssignment_distributorUserId_idx" ON "WeeklyDistributorAssignment"("distributorUserId");

-- CreateIndex
CREATE INDEX "WeeklyDistributorAssignment_status_idx" ON "WeeklyDistributorAssignment"("status");

-- CreateIndex
CREATE INDEX "WeeklyDistributorAssignment_deletedAt_idx" ON "WeeklyDistributorAssignment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyDistributorAssignment_groupId_weekKey_key" ON "WeeklyDistributorAssignment"("groupId", "weekKey");

-- CreateIndex
CREATE INDEX "Payment_associationId_idx" ON "Payment"("associationId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_monthKey_idx" ON "Payment"("monthKey");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_externalTransactionId_key" ON "Payment"("externalTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPaymentStatus_paymentId_key" ON "MonthlyPaymentStatus"("paymentId");

-- CreateIndex
CREATE INDEX "MonthlyPaymentStatus_associationId_idx" ON "MonthlyPaymentStatus"("associationId");

-- CreateIndex
CREATE INDEX "MonthlyPaymentStatus_userId_idx" ON "MonthlyPaymentStatus"("userId");

-- CreateIndex
CREATE INDEX "MonthlyPaymentStatus_monthKey_idx" ON "MonthlyPaymentStatus"("monthKey");

-- CreateIndex
CREATE INDEX "MonthlyPaymentStatus_status_idx" ON "MonthlyPaymentStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPaymentStatus_userId_monthKey_key" ON "MonthlyPaymentStatus"("userId", "monthKey");

-- CreateIndex
CREATE INDEX "PaymentReminder_associationId_idx" ON "PaymentReminder"("associationId");

-- CreateIndex
CREATE INDEX "PaymentReminder_userId_idx" ON "PaymentReminder"("userId");

-- CreateIndex
CREATE INDEX "PaymentReminder_monthKey_idx" ON "PaymentReminder"("monthKey");

-- CreateIndex
CREATE INDEX "PaymentReminder_channel_idx" ON "PaymentReminder"("channel");

-- CreateIndex
CREATE INDEX "PaymentReminder_deletedAt_idx" ON "PaymentReminder"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReminder_userId_monthKey_sequence_key" ON "PaymentReminder"("userId", "monthKey", "sequence");

-- CreateIndex
CREATE INDEX "Notification_associationId_idx" ON "Notification"("associationId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");

-- CreateIndex
CREATE INDEX "PushSubscription_associationId_idx" ON "PushSubscription"("associationId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_isActive_idx" ON "PushSubscription"("isActive");

-- CreateIndex
CREATE INDEX "PushSubscription_deletedAt_idx" ON "PushSubscription"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionGroup" ADD CONSTRAINT "DistributionGroup_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionGroup" ADD CONSTRAINT "DistributionGroup_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DistributionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_distributionGroupId_fkey" FOREIGN KEY ("distributionGroupId") REFERENCES "DistributionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyOrder" ADD CONSTRAINT "WeeklyOrder_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyOrder" ADD CONSTRAINT "WeeklyOrder_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyDistributorAssignment" ADD CONSTRAINT "WeeklyDistributorAssignment_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyDistributorAssignment" ADD CONSTRAINT "WeeklyDistributorAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DistributionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyDistributorAssignment" ADD CONSTRAINT "WeeklyDistributorAssignment_distributorUserId_fkey" FOREIGN KEY ("distributorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPaymentStatus" ADD CONSTRAINT "MonthlyPaymentStatus_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPaymentStatus" ADD CONSTRAINT "MonthlyPaymentStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPaymentStatus" ADD CONSTRAINT "MonthlyPaymentStatus_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
