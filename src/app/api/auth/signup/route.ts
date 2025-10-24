import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = signupSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: '입력 정보가 올바르지 않습니다' },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: '이미 등록된 이메일입니다' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
