ALTER TABLE "User"
  ADD COLUMN "registrationCompleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "groupSelectionCompleted" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_registrationCompleted_idx" ON "User"("registrationCompleted");
CREATE INDEX "User_groupSelectionCompleted_idx" ON "User"("groupSelectionCompleted");

