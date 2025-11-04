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
        console.log('[Auth] Authorize called with:', {
          ...credentials,
          password: credentials?.password ? '***' : undefined
        });

        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          console.log('[Auth] Validation failed:', validatedFields.error);
          return null;
        }

        const { userId, password, studentId, userType } = validatedFields.data;
        console.log('[Auth] Validated:', { userId, userType, studentId });

        if (userType === 'teacher') {
          // 교사 로그인
          console.log('[Auth] Teacher login attempt:', userId);
          const teacher = await prisma.teacher.findFirst({
            where: { teacherId: userId },
            include: { user: true },
          });

          console.log('[Auth] Teacher found:', !!teacher);

          if (!teacher || !teacher.user.password) {
            console.log('[Auth] Teacher not found or no password');
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, teacher.user.password);
          console.log('[Auth] Password match:', passwordsMatch);

          if (!passwordsMatch) {
            return null;
          }

          console.log('[Auth] Teacher login success');
          return {
            id: teacher.user.id,
            email: teacher.user.email,
            name: teacher.name,
            role: 'TEACHER',
            teacherId: teacher.teacherId,
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
            grade: student.grade,
            class: student.class,
            number: student.number,
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
      // JWT 토큰에서 정보 가져오기 (Prisma 사용 안 함)
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as any;
        session.user.studentId = token.studentId as string | undefined;
        session.user.teacherId = token.teacherId as string | undefined;
        session.user.grade = token.grade as number | undefined;
        session.user.class = token.class as number | undefined;
        session.user.number = token.number as number | undefined;
      }

      return session;
    },
    async jwt({ token, user }) {
      // 최초 로그인 시 user 정보를 JWT 토큰에 저장
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.studentId = (user as any).studentId;
        token.teacherId = (user as any).teacherId;
        token.grade = (user as any).grade;
        token.class = (user as any).class;
        token.number = (user as any).number;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
