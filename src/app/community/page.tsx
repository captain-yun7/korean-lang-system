import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '커뮤니티',
  description: '강의에 대한 질문과 정보를 공유하세요.',
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-bg-light py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            {/* Content */}
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              커뮤니티
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              곧 만나보실 수 있습니다
            </p>
            <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
              <p className="text-lg text-text-primary mb-4">
                현재 커뮤니티 기능을 준비 중입니다.
              </p>
              <p className="text-text-secondary">
                수강생들과 함께 소통하고, 질문을 주고받으며, 학습 경험을 공유할 수 있는<br />
                커뮤니티 공간이 곧 오픈됩니다.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">질문과 답변</h3>
                <p className="text-sm text-text-secondary">강의 관련 질문을 자유롭게</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">학습 자료 공유</h3>
                <p className="text-sm text-text-secondary">유용한 학습 자료 공유</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">스터디 그룹</h3>
                <p className="text-sm text-text-secondary">함께 학습하는 즐거움</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn-primary">
                강의 둘러보기
              </Link>
              <Link href="/" className="btn-secondary">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
