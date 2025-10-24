import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '소개',
  description: 'Private LMS는 전문가와 함께하는 온라인 강의 플랫폼입니다.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-purple-700 text-white py-20 md:py-28">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Private LMS는?
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
              전문가와 함께하는 온라인 강의 플랫폼으로,<br />
              언제 어디서나 최고의 강의를 만나보세요
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              왜 Private LMS인가요?
            </h2>
            <p className="text-lg text-text-secondary">
              학습자 중심의 최적화된 온라인 교육 환경을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">고품질 강의</h3>
              <p className="text-text-secondary">
                전문가가 직접 제작한 검증된 고품질 강의 콘텐츠
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">유연한 학습</h3>
              <p className="text-text-secondary">
                언제 어디서나 원하는 시간에 자유롭게 학습
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">체계적 관리</h3>
              <p className="text-text-secondary">
                진도율 추적 및 학습 현황을 한눈에 확인
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">안전한 시청</h3>
              <p className="text-text-secondary">
                장치 제한으로 안전하게 보호된 강의 콘텐츠
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">1:1 지원</h3>
              <p className="text-text-secondary">
                강의 관련 질문에 대한 빠른 답변 제공
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">학습 자료</h3>
              <p className="text-text-secondary">
                강의와 함께 제공되는 다양한 학습 자료
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-bg-light">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              전문가와 함께 성장하는 학습 경험을 만나보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="btn-primary text-lg px-8 py-4"
              >
                강의 둘러보기
              </Link>
              <Link
                href="/signup"
                className="btn-secondary text-lg px-8 py-4"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
