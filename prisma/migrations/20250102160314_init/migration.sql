-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "registerNumber" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grade_registerNumber_key" ON "Grade"("registerNumber");
