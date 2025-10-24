import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1),
  studentId: z.string().optional(), // 학생인 경우 학번
  userType: z.enum(['student', 'teacher']),
});

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
        studentId: { label: 'Student ID', type: 'text' },
        userType: { label: 'User Type', type: 'text' },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { userId, password, studentId, userType } = validatedFields.data;

        if (userType === 'teacher') {
          // 교사 로그인
          const teacher = await prisma.teacher.findFirst({
            where: { teacherId: userId },
            include: { user: true },
          });

          if (!teacher || !teacher.user.password) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, teacher.user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: teacher.user.id,
            email: teacher.user.email,
            name: teacher.name,
            role: 'TEACHER',
          };
        } else {
          // 학생 로그인
          if (!studentId) {
            return null;
          }

          const student = await prisma.student.findFirst({
            where: {
              studentId: studentId,
            },
            include: { user: true },
          });

          if (!student || !student.user.password || !student.isActive) {
            return null;
          }

          // userId가 일치하는지 확인 (추가 보안)
          if (student.user.email !== userId) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, student.user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: student.user.id,
            email: student.user.email,
            name: student.name,
            role: 'STUDENT',
            studentId: student.studentId,
          };
        }
      },
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            student: {
              select: {
                studentId: true,
                grade: true,
                class: true,
                number: true,
              }
            },
            teacher: {
              select: {
                teacherId: true,
              }
            }
          },
        });

        if (dbUser) {
          session.user.role = dbUser.role;

          if (dbUser.student) {
            session.user.studentId = dbUser.student.studentId;
            session.user.grade = dbUser.student.grade;
            session.user.class = dbUser.student.class;
            session.user.number = dbUser.student.number;
          }

          if (dbUser.teacher) {
            session.user.teacherId = dbUser.teacher.teacherId;
          }
        }
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
