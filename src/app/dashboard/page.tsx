import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '대시보드',
  description: '내 강의 및 학습 현황을 확인하세요.',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Header />

      <main className="flex-1 py-12">
        <div className="container">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || '사용자'}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  환영합니다, {session.user.name || '사용자'}님!
                </h1>
                <p className="text-text-secondary mt-1">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-secondary">수강 중인 강의</h3>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-text-primary">0</p>
              <p className="text-sm text-text-secondary mt-2">강의를 구매하고 학습을 시작하세요</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-secondary">완료한 강의</h3>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-text-primary">0</p>
              <p className="text-sm text-text-secondary mt-2">완료된 강의가 없습니다</p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-secondary">학습 시간</h3>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-text-primary">0<span className="text-2xl text-text-secondary ml-1">시간</span></p>
              <p className="text-sm text-text-secondary mt-2">총 학습 시간</p>
            </div>
          </div>

          {/* My Courses Section */}
          <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">내 강의</h2>
              <a href="/courses" className="text-primary hover:text-primary-dark font-medium flex items-center gap-2">
                강의 둘러보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="text-center py-16">
              <div className="w-20 h-20 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">수강 중인 강의가 없습니다</h3>
              <p className="text-text-secondary mb-6">관심 있는 강의를 둘러보고 학습을 시작해보세요!</p>
              <a
                href="/courses"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                강의 찾아보기
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">최근 학습 활동</h2>

            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-text-secondary">최근 학습 활동이 없습니다</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
