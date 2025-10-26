import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('📊 데이터베이스 사용자 확인...\n');

  // 모든 사용자 조회
  const users = await prisma.user.findMany({
    include: {
      teacher: true,
      student: true,
    },
  });

  console.log(`전체 사용자 수: ${users.length}\n`);

  users.forEach((user, index) => {
    console.log(`--- 사용자 ${index + 1} ---`);
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password Hash: ${user.password?.substring(0, 20)}...`);

    if (user.teacher) {
      console.log(`교사 정보:`);
      console.log(`  - Teacher ID: ${user.teacher.teacherId}`);
      console.log(`  - Name: ${user.teacher.name}`);
    }

    if (user.student) {
      console.log(`학생 정보:`);
      console.log(`  - Student ID: ${user.student.studentId}`);
      console.log(`  - Name: ${user.student.name}`);
      console.log(`  - Grade/Class/Number: ${user.student.grade}학년 ${user.student.class}반 ${user.student.number}번`);
      console.log(`  - Active: ${user.student.isActive}`);
    }

    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
