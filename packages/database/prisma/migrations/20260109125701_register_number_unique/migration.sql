/*
  Warnings:

  - A unique constraint covering the columns `[registerNumber]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_registerNumber_key" ON "user"("registerNumber");
