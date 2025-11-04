import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create teacher account
  console.log('Creating teacher account...');
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher001@system.local',
      name: 'Teacher Kim',
      password: hashedPassword,
      role: 'TEACHER',
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      teacherId: 'teacher001',
      name: 'Teacher Kim',
    },
  });

  console.log('Teacher created: teacher001 / password123 (teacherId: teacher001)');

  // Create student account
  console.log('Creating student account...');
  const studentUser = await prisma.user.create({
    data: {
      email: 'student001',
      name: 'Student Hong',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });

  await prisma.student.create({
    data: {
      userId: studentUser.id,
      studentId: '030101',
      name: 'Student Hong',
      schoolLevel: 'high',
      grade: 3,
      class: 1,
      number: 1,
      isActive: true,
    },
  });

  console.log('Student created: student001 / password123 (studentId: 030101, Grade 3, Class 1, No. 1)');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
