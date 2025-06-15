import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixExamStatus() {
  try {
    console.log("Fixing NULL status values in Grade table...");

    // status가 NULL인 레코드를 PENDING으로 업데이트
    const examPayload = await prisma.exam.updateMany({
      where: { status: null },
      data: { status: "NEW" },
    });

    console.log(`Updated ${examPayload.count} Exam records with status NEW.`);

    console.log("Fixing NULL status values in Exam table...");

    // status가 NULL인 레코드를 PENDING으로 업데이트
    const gradePayload = await prisma.grade.updateMany({
      where: { status: null },
      data: { status: "NEW" },
    });

    console.log(`Updated ${gradePayload.count} Grade records with status NEW.`);
  } catch (error) {
    console.error("Error during status fix:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExamStatus();
