import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixGradeSystemId() {
  try {
    console.log("Checking invalid systemId in Grade...");

    // User.id 목록 가져오기
    const userIds = await prisma.user
      .findMany()
      .then((users) => users.map((u) => u.systemId));

    // Grade.systemId가 User.id에 없는 레코드 찾기
    const invalidGrades = await prisma.grade.findMany({
      where: {
        systemId: { notIn: userIds },
      },
    });

    if (invalidGrades.length > 0) {
      console.log(`Found ${invalidGrades.length} invalid Grade records:`);
      console.log(
        invalidGrades.map((g) => ({
          id: g.id,
          systemId: g.systemId,
          name: g.displayName,
        }))
      );

      // 처리 옵션 1: 유효하지 않은 Grade 레코드 삭제
      for (const grade of invalidGrades) {
        await prisma.grade.delete({
          where: { systemId: grade.systemId },
        });
        console.log(
          `Deleted Grade (id: ${grade.id}, systemId: ${grade.systemId})`
        );
      }

      // // 처리 옵션 2: 새로운 User 생성 (필요 시 주석 해제)
      // for (const grade of invalidGrades) {
      //   await prisma.user.create({
      //     data: {
      //       id: grade.systemId, // systemId를 User.id로 사용
      //       name: 'Placeholder User',
      //       registerNumber: `TEMP-${grade.systemId}`,
      //       type: 'ESIS',
      //       role: 'STUDENT',
      //       systemId: grade.systemId,
      //     },
      //   });
      //   console.log(`Created User for systemId: ${grade.systemId}`);
      // }

      // // 처리 옵션 3: systemId를 유효한 User.id로 업데이트 (필요 시 주석 해제)
      // const defaultUserId = (await prisma.user.findFirst())?.id;
      // if (!defaultUserId) throw new Error('No valid User found to map');
      // for (const grade of invalidGrades) {
      //   await prisma.grade.update({
      //     where: { id: grade.id },
      //     data: { systemId: defaultUserId },
      //   });
      //   console.log(`Updated Grade (id: ${grade.id}) systemId to ${defaultUserId}`);
      // }
    } else {
      console.log("No invalid systemId found in Grade");
    }

    console.log("Checking invalid systemId in Exam...");
    const invalidExams = await prisma.exam.findMany({
      where: {
        systemId: { notIn: userIds },
      },
    });

    if (invalidExams.length > 0) {
      console.log(`Found ${invalidExams.length} invalid Exam records:`);
      console.log(
        invalidExams.map((e) => ({ id: e.id, systemId: e.systemId }))
      );

      // 삭제
      for (const exam of invalidExams) {
        await prisma.exam.delete({
          where: { id: exam.id },
        });
        console.log(
          `Deleted Exam (id: ${exam.id}, systemId: ${exam.systemId})`
        );
      }
    } else {
      console.log("No invalid systemId found in Exam");
    }

    console.log("SystemId validation completed");
  } catch (error) {
    console.error("Error during systemId fix:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGradeSystemId();
