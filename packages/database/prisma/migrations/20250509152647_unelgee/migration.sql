-- CreateTable
CREATE TABLE "UnelgeeSubjects" (
    "id" TEXT NOT NULL,
    "lessonName" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "teacherLastName" TEXT NOT NULL,
    "teacherFirstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "registerNumber" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "class" TEXT NOT NULL,

    CONSTRAINT "UnelgeeSubjects_pkey" PRIMARY KEY ("id")
);
