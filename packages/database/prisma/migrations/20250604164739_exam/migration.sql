-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_testId_key" ON "Exam"("testId");
