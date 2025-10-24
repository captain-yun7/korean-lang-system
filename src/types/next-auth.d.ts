import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      studentId?: string;
      teacherId?: string;
      grade?: number;
      class?: number;
      number?: number;
    };
  }

  interface User {
    role: Role;
    studentId?: string;
    teacherId?: string;
  }
}
