import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import TeacherLayoutClient from '@/components/TeacherLayoutClient';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 인증되지 않았거나 교사가 아닌 경우 루트 페이지로 리다이렉트
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  return (
    <TeacherLayoutClient user={session.user}>
      {children}
    </TeacherLayoutClient>
  );
}
