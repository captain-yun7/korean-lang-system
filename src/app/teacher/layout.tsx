import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/auth/config';
import { TeacherSidebar } from '@/components/TeacherSidebar';
import { TeacherHeader } from '@/components/TeacherHeader';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  // 인증되지 않았거나 교사가 아닌 경우 로그인 페이지로 리다이렉트
  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TeacherHeader user={session.user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
