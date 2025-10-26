import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 테스트 계정 비밀번호 초기화...\n');

  // 1. 기존 계정 삭제
  await prisma.result.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ 기존 계정 삭제 완료\n');

  // 2. 새로운 계정 생성
  const teacherPassword = await bcrypt.hash('123456', 10);
  const studentPassword = await bcrypt.hash('123456', 10);

  // 교사 계정
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@test.com',
      password: teacherPassword,
      name: '김선생',
      role: 'TEACHER',
      teacher: {
        create: {
          teacherId: 'teacher001',
          name: '김선생',
        },
      },
    },
  });

  console.log('✅ 교사 계정 생성 완료');
  console.log('   교사 ID: teacher001');
  console.log('   비밀번호: 123456\n');

  // 학생 계정
  const student = await prisma.user.create({
    data: {
      email: 'student001',
      password: studentPassword,
      name: '김철수',
      role: 'STUDENT',
      student: {
        create: {
          studentId: '030201',
          name: '김철수',
          grade: 3,
          class: 2,
          number: 1,
          isActive: true,
          activationStartDate: new Date(),
          activationEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log('✅ 학생 계정 생성 완료');
  console.log('   학번: 030201');
  console.log('   아이디: student001');
  console.log('   비밀번호: 123456\n');

  console.log('🎉 테스트 계정 초기화 완료!');
  console.log('\n📝 로그인 정보:');
  console.log('교사: teacher001 / 123456');
  console.log('학생: 030201, student001 / 123456');
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
