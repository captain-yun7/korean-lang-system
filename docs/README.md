# Private LMS - 프로젝트 문서

## 📚 문서 구조

이 폴더에는 Private LMS 프로젝트의 전체 기획 및 설계 문서가 포함되어 있습니다.

### 문서 목록

1. **[features.md](./features.md)** - 기능 명세서
   - 프로젝트 개요
   - 참고 사이트 분석 (하우위 잉글리시)
   - 기술 스택
   - 상세 기능 명세 (A~H 섹션)
   - 우선순위 및 Phase 구분
   - 제외 기능

2. **[database-schema.md](./database-schema.md)** - 데이터베이스 스키마 설계
   - Prisma 스키마 전체 코드
   - ERD (Entity Relationship Diagram)
   - 인덱스 전략
   - 마이그레이션 전략
   - Seed 데이터 예시

3. **[wbs.md](./wbs.md)** - Work Breakdown Structure (작업 분류 및 일정)
   - Phase 1~7 작업 목록
   - 각 Phase별 예상 기간
   - 우선순위
   - 리스크 관리

4. **[README.md](./README.md)** - 이 문서
   - 문서 구조 안내
   - 프로젝트 빠른 시작 가이드

---

## 🚀 프로젝트 개요

### 프로젝트명
**Private LMS** (개인 온라인 강의 사이트)

### 목적
개인 강사의 온라인 강의 판매 및 수강 관리를 위한 LMS(Learning Management System) 플랫폼

### 주요 특징
- 개인 강사 중심의 온라인 강의 플랫폼
- 학생(일반 사용자)과 관리자(강사) 2개의 사용자 그룹
- 강의별 개별 구매 방식
- Vimeo 기반 동영상 스트리밍
- 토스페이먼츠 결제 연동
- 4가지 로그인 방식 (일반, Google, Kakao, Naver)

### 참고 사이트
- [하우위 잉글리시](https://www.howweenglish.com/main/main)

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui (또는 커스텀)
- **Rich Text Editor**: Tiptap
- **Form Handling**: React Hook Form + Zod

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
  - Providers: Credentials, Google, Kakao, Naver
- **File Storage**: Supabase Storage
- **Video Streaming**: Vimeo API (Vimeo Starter Plan)
- **Payment Gateway**: 토스페이먼츠

### DevOps
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Version Control**: Git/GitHub
- **CI/CD**: Vercel Auto Deploy

---

## 📋 핵심 기능

### 사용자 (학생)
- ✅ 4가지 로그인 방식 (일반, Google, Kakao, Naver)
- ✅ 강의 목록 조회 및 검색
- ✅ 강의 상세 정보 및 미리보기 영상 시청
- ✅ 강의 구매 (카드 결제 / 무통장입금)
- ✅ 강의 수강 (Vimeo 플레이어)
- ✅ 진도율 추적 및 이어보기
- ✅ 강의 자료 다운로드
- ✅ 등록기기 관리 (최대 2개)
- ✅ 공지사항 조회
- ✅ 1:1 문의 (리치 텍스트 에디터)
- ✅ 영수증 / 세금계산서 발급
- ✅ 환불 신청

### 관리자 (강사)
- ✅ 강의 생성 / 수정 / 삭제
- ✅ Vimeo 영상 연동 및 관리
- ✅ 영상 순서 관리 및 미리보기 지정
- ✅ 강의 자료 업로드 / 삭제
- ✅ 학생 관리 (회원 목록, 수강 현황)
- ✅ 무통장입금 승인 / 거절
- ✅ 환불 승인 / 거절
- ✅ 세금계산서 발행
- ✅ 공지사항 작성 / 수정 / 삭제
- ✅ 1:1 문의 답변
- ✅ 통계 / 리포트 (매출, 수강 현황)

---

## 📅 개발 일정

### 총 예상 기간
**12-18주 (약 3-4.5개월)**

### Phase 구분
1. **Phase 1**: 기본 인프라 (1-2주)
2. **Phase 2**: 핵심 강의 기능 (3-4주)
3. **Phase 3**: 결제 시스템 (2-3주)
4. **Phase 4**: 진도율 및 학습 관리 (1-2주)
5. **Phase 5**: 부가 기능 (2-3주)
6. **Phase 6**: 관리자 고도화 (2주)
7. **Phase 7**: 최적화 및 배포 (1-2주)

자세한 일정은 [wbs.md](./wbs.md)를 참고하세요.

---

## 🎯 MVP (Minimum Viable Product)

### MVP 범위 (Phase 1~4)
- 사용자 인증 (4가지 로그인)
- 강의 목록 / 상세 / 수강
- 결제 (카드 / 무통장입금)
- 진도율 추적
- 관리자 강의 관리

### MVP 이후 추가 기능 (Phase 5~7)
- 등록기기 관리
- 공지사항
- 1:1 문의
- 세금계산서
- 통계 / 리포트
- 성능 최적화

---

## 🗂 주요 데이터 모델

### 인증 관련
- User (사용자)
- Account (소셜 로그인 계정)
- Session (세션)

### 강의 관련
- Course (강의)
- Video (영상)
- CourseFile (강의 자료)

### 결제 관련
- Purchase (구매)
- Payment (결제 정보)
- BankTransfer (무통장입금)
- Receipt (영수증)
- TaxInvoice (세금계산서)
- Refund (환불)

### 수강 관련
- Enrollment (수강 등록)
- Progress (진도율)

### 기타
- Device (등록 기기)
- Notice (공지사항)
- Inquiry (1:1 문의)
- InquiryReply (문의 답변)

자세한 스키마는 [database-schema.md](./database-schema.md)를 참고하세요.

---

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+ (또는 20+)
- npm 또는 yarn 또는 pnpm
- Supabase 계정
- Vimeo 계정
- 토스페이먼츠 계정
- Google, Kakao, Naver OAuth 앱 생성

### 환경 변수

`.env.local` 파일 생성 후 다음 변수 설정:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# Naver OAuth
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Vimeo
VIMEO_ACCESS_TOKEN="your-vimeo-access-token"

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY="your-toss-client-key"
TOSS_SECRET_KEY="your-toss-secret-key"
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Prisma 마이그레이션
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate

# 개발 서버 실행
npm run dev
```

### Prisma Studio (DB GUI)

```bash
npx prisma studio
```

---

## 📖 문서 읽기 순서

처음 프로젝트를 이해하시는 분은 다음 순서로 문서를 읽는 것을 추천합니다:

1. **[features.md](./features.md)** - 전체 기능 이해
2. **[database-schema.md](./database-schema.md)** - 데이터 구조 이해
3. **[wbs.md](./wbs.md)** - 개발 일정 및 작업 순서 이해
4. 개발 시작!

---

## 🎨 디자인 가이드

### UI/UX 원칙
- **간결함**: 불필요한 요소 제거, 핵심 기능에 집중
- **직관성**: 사용자가 쉽게 이해하고 사용할 수 있는 UI
- **일관성**: 동일한 디자인 패턴 유지
- **반응형**: 모바일/태블릿/데스크톱 모두 지원

### 색상 (예시 - 변경 가능)
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### 폰트 (예시 - 변경 가능)
- **한글**: Pretendard, Noto Sans KR
- **영문**: Inter, Roboto

---

## 🔒 보안 고려사항

### 인증 / 인가
- NextAuth.js v5 사용 (검증된 라이브러리)
- 비밀번호 bcrypt 해싱
- JWT 토큰 사용
- 관리자 권한 확인 (Middleware)

### 결제
- 토스페이먼츠 공식 SDK 사용
- 결제 정보 서버에서만 처리
- 시크릿 키 환경 변수로 관리

### 파일 업로드
- 파일 형식 검증 (MIME type)
- 파일 크기 제한
- Supabase Storage 권한 설정

### API
- CORS 설정
- Rate Limiting (선택적)
- CSRF 방지 (NextAuth.js 기본 제공)

---

## 📈 성능 최적화

### 이미지
- Next.js Image 컴포넌트 사용
- WebP 포맷
- Lazy Loading

### 코드
- Dynamic Import
- Code Splitting
- Tree Shaking

### 데이터베이스
- 인덱싱
- N+1 문제 해결 (Prisma include)
- Connection Pooling (Supabase)

### 캐싱
- ISR (Incremental Static Regeneration)
- SWR 또는 React Query (선택적)

---

## 🧪 테스트

### 테스트 전략 (선택적)
- **Unit Test**: Jest + React Testing Library
- **Integration Test**: Playwright 또는 Cypress
- **E2E Test**: Playwright

### 테스트 우선순위
1. 결제 플로우 (카드 결제, 무통장입금)
2. 인증 플로우 (로그인, 회원가입)
3. 강의 수강 플로우
4. 관리자 기능

---

## 🚢 배포

### Vercel 배포
1. GitHub 저장소 생성 및 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정 (Vercel 대시보드)
4. 자동 배포 완료

### 프로덕션 체크리스트
- [ ] 환경 변수 모두 설정
- [ ] Prisma 마이그레이션 (`npx prisma migrate deploy`)
- [ ] Supabase 프로덕션 설정
- [ ] 토스페이먼츠 실제 키로 변경
- [ ] 도메인 연결 (선택적)
- [ ] HTTPS 확인
- [ ] 최종 테스트

---

## 🤝 기여 및 피드백

이 프로젝트는 1인 개발 프로젝트이지만, 향후 확장 가능성을 염두에 두고 설계되었습니다.

### 추후 추가 가능한 기능
- 수강후기 / 리뷰 시스템
- 퀴즈 / 시험 기능
- 수료증 발급
- 강의 카테고리 / 필터
- 쿠폰 / 할인 시스템
- 모바일 앱 (PWA)
- 다크 모드

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성하거나 이메일로 연락주세요.

---

## 📝 라이선스

이 프로젝트는 개인 프로젝트이며, 라이선스는 추후 결정됩니다.

---

## ✨ 마무리

이 문서들은 Private LMS 프로젝트의 전체 청사진입니다.

각 문서를 참고하여 체계적으로 개발을 진행하시기 바랍니다.

**화이팅!** 🚀

---

**작성일**: 2025-01-19
**버전**: 1.0.0
