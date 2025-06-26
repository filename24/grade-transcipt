-- DropIndex
DROP INDEX "User_registerNumber_systemId_idx";

-- CreateIndex
CREATE INDEX "User_firstName_lastName_idx" ON "User"("firstName", "lastName");
