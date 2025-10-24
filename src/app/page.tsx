import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-purple-700 text-white py-24 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
              전문가와 함께하는<br />
              <span className="text-yellow-300">온라인 강의</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              언제 어디서나 최고의 강의를 들을 수 있습니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/courses"
                className="btn-primary text-lg px-8 py-4"
              >
                강의 둘러보기
              </Link>
              <Link
                href="/about"
                className="btn-secondary text-lg px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-white/40"
              >
                자세히 알아보기
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bg-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Private LMS의 특징
            </h2>
            <p className="text-lg text-text-secondary">
              학습을 더욱 효율적으로 만드는 다양한 기능
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">언제 어디서나</h3>
              <p className="text-text-secondary">
                PC, 태블릿, 모바일 등<br />모든 기기에서 학습 가능
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">진도율 관리</h3>
              <p className="text-text-secondary">
                학습 진행 상황을<br />한눈에 파악하고 관리
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">1:1 문의</h3>
              <p className="text-text-secondary">
                강의에 대한 질문은<br />빠르고 친절한 답변 제공
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Preview Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                인기 강의
              </h2>
              <p className="text-lg text-text-secondary">
                지금 가장 많은 수강생이 선택한 강의
              </p>
            </div>
            <Link
              href="/courses"
              className="btn-text text-primary hover:text-primary-dark hidden md:flex items-center gap-2"
            >
              전체 강의 보기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Course Card 1 */}
            <div className="card-hover group">
              <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">개발</span>
                  <span>12시간</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                  웹 개발 완벽 가이드
                </h3>
                <p className="text-text-secondary text-sm line-clamp-2">
                  HTML, CSS, JavaScript부터 React까지 모던 웹 개발의 모든 것
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">₩99,000</span>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>4.8 (234)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="card-hover group">
              <div className="relative aspect-video bg-gradient-to-br from-pink-500 to-red-600 rounded-lg mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-medium">디자인</span>
                  <span>8시간</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                  UI/UX 디자인 기초
                </h3>
                <p className="text-text-secondary text-sm line-clamp-2">
                  사용자 중심의 인터페이스 디자인 원칙과 실전 프로젝트
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">₩79,000</span>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>4.9 (189)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="card-hover group">
              <div className="relative aspect-video bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">마케팅</span>
                  <span>10시간</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                  디지털 마케팅 전략
                </h3>
                <p className="text-text-secondary text-sm line-clamp-2">
                  SNS, 콘텐츠, SEO까지 효과적인 온라인 마케팅 기법
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">₩89,000</span>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>4.7 (156)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center md:hidden">
            <Link
              href="/courses"
              className="btn-secondary inline-flex items-center gap-2"
            >
              전체 강의 보기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-gray-100 mb-8">
              전문가와 함께 성장하는 학습 경험을 만나보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-primary bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/courses"
                className="btn-secondary text-lg px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-white/40"
              >
                강의 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
