import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// .env 파일 로드
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 테스트 계정 생성 시작...\n');

  // 교사 계정 생성
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
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
  console.log('   - 교사 ID: teacher001');
  console.log('   - 비밀번호: teacher123\n');

  // 학생 계정 생성
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student001' },
    update: {},
    create: {
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
          activationEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
        },
      },
    },
  });
  console.log('✅ 학생 계정 생성 완료');
  console.log('   - 학번: 030201');
  console.log('   - 아이디: student001');
  console.log('   - 비밀번호: student123');
  console.log('   - 정보: 3학년 2반 1번 김철수\n');

  console.log('🎉 테스트 계정 생성 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
