import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '문의',
  description: '궁금한 사항을 문의하세요.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-bg-light py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                문의하기
              </h1>
              <p className="text-lg text-text-secondary">
                궁금한 사항이 있으신가요? 언제든지 문의해주세요.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-text-primary mb-6">연락처 정보</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">이메일</h3>
                        <p className="text-text-secondary text-sm">support@privatelms.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">운영 시간</h3>
                        <p className="text-text-secondary text-sm">평일 09:00 - 18:00<br />(주말 및 공휴일 휴무)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">1:1 문의</h3>
                        <p className="text-text-secondary text-sm">로그인 후 대시보드에서<br />1:1 문의를 이용하세요</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Placeholder */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">문의 양식</h2>

                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      문의 기능 준비 중
                    </h3>
                    <p className="text-text-secondary mb-8">
                      문의 양식 기능은 현재 개발 중입니다.<br />
                      당분간 이메일로 문의해주시기 바랍니다.
                    </p>

                    <div className="bg-bg-light rounded-xl p-6 mb-8">
                      <p className="text-text-primary mb-4">
                        <span className="font-semibold">이메일:</span> support@privatelms.com
                      </p>
                      <p className="text-sm text-text-secondary">
                        문의 시 다음 정보를 포함해주세요:<br />
                        - 제목<br />
                        - 문의 내용<br />
                        - 연락 가능한 이메일 또는 전화번호
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="mailto:support@privatelms.com"
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        이메일 보내기
                      </a>
                      <Link href="/" className="btn-secondary">
                        홈으로 돌아가기
                      </Link>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-card p-8 mt-8">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">자주 묻는 질문</h2>

                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-5">
                      <h3 className="font-semibold text-text-primary mb-2">강의는 어떻게 수강하나요?</h3>
                      <p className="text-text-secondary text-sm">
                        회원가입 후 원하는 강의를 선택하여 결제하면 바로 수강하실 수 있습니다.
                      </p>
                    </div>

                    <div className="border border-border rounded-lg p-5">
                      <h3 className="font-semibold text-text-primary mb-2">환불은 가능한가요?</h3>
                      <p className="text-text-secondary text-sm">
                        강의 시청 전이라면 전액 환불이 가능합니다. 자세한 환불 정책은 이용약관을 확인해주세요.
                      </p>
                    </div>

                    <div className="border border-border rounded-lg p-5">
                      <h3 className="font-semibold text-text-primary mb-2">강의는 얼마 동안 볼 수 있나요?</h3>
                      <p className="text-text-secondary text-sm">
                        구매한 강의는 기간 제한 없이 평생 수강 가능합니다.
                      </p>
                    </div>

                    <div className="border border-border rounded-lg p-5">
                      <h3 className="font-semibold text-text-primary mb-2">모바일에서도 수강할 수 있나요?</h3>
                      <p className="text-text-secondary text-sm">
                        네, PC, 태블릿, 모바일 등 모든 기기에서 수강 가능합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
