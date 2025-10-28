import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const teacherCount = await prisma.teacher.count();
  const studentCount = await prisma.student.count();
  const passageCount = await prisma.passage.count();
  const questionCount = await prisma.question.count();
  const resultCount = await prisma.result.count();
  const wrongAnswerCount = await prisma.wrongAnswer.count();
  const assignedPassageCount = await prisma.assignedPassage.count();

  console.log('📊 Database Status:');
  console.log('==================');
  console.log(`👤 Users: ${userCount}`);
  console.log(`👨‍🏫 Teachers: ${teacherCount}`);
  console.log(`👨‍🎓 Students: ${studentCount}`);
  console.log(`📚 Passages: ${passageCount}`);
  console.log(`❓ Questions: ${questionCount}`);
  console.log(`📝 Results: ${resultCount}`);
  console.log(`❌ Wrong Answers: ${wrongAnswerCount}`);
  console.log(`📋 Assigned Passages: ${assignedPassageCount}`);
  console.log('==================');

  // 샘플 사용자 조회
  const users = await prisma.user.findMany({
    take: 5,
    select: {
      email: true,
      role: true,
      name: true,
    },
  });

  console.log('\n👥 Sample Users:');
  users.forEach((u) => {
    console.log(`  - ${u.name} (${u.email}) [${u.role}]`);
  });

  if (passageCount > 0) {
    const passages = await prisma.passage.findMany({
      take: 3,
      select: {
        title: true,
        category: true,
        difficulty: true,
      },
    });

    console.log('\n📚 Sample Passages:');
    passages.forEach((p) => {
      console.log(`  - ${p.title} [${p.category}, ${p.difficulty}]`);
    });
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
