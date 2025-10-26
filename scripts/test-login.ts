import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 교사 로그인 테스트...\n');

  const teacherId = 'teacher001';
  const inputPassword = 'teacher123';

  // 1. teacherId로 교사 찾기
  const teacher = await prisma.teacher.findFirst({
    where: { teacherId: teacherId },
    include: { user: true },
  });

  console.log('1. Teacher 조회 결과:');
  if (teacher) {
    console.log(`   ✅ 교사 찾음: ${teacher.name}`);
    console.log(`   - User ID: ${teacher.user.id}`);
    console.log(`   - Email: ${teacher.user.email}`);
    console.log(`   - Has Password: ${!!teacher.user.password}`);
  } else {
    console.log('   ❌ 교사를 찾을 수 없습니다');
    return;
  }

  // 2. 비밀번호 확인
  if (!teacher.user.password) {
    console.log('\n2. 비밀번호 체크: ❌ 비밀번호가 저장되지 않음');
    return;
  }

  const passwordsMatch = await bcrypt.compare(inputPassword, teacher.user.password);
  console.log(`\n2. 비밀번호 체크: ${passwordsMatch ? '✅ 일치' : '❌ 불일치'}`);
  console.log(`   - Input: ${inputPassword}`);
  console.log(`   - Hash: ${teacher.user.password.substring(0, 30)}...`);

  if (passwordsMatch) {
    console.log('\n✅ 로그인 성공! 다음 정보가 반환됩니다:');
    console.log({
      id: teacher.user.id,
      email: teacher.user.email,
      name: teacher.name,
      role: 'TEACHER',
    });
  } else {
    console.log('\n❌ 로그인 실패: 비밀번호가 일치하지 않습니다');
  }
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
