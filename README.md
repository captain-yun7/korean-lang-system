# 국어 학습 통합 시스템 - 프로젝트 문서

## 📚 문서 구조

이 폴더에는 국어 학습 통합 시스템 프로젝트의 전체 기획 및 설계 문서가 포함되어 있습니다.

### 문서 목록

1. **[features.md](./features.md)** - 기능 명세서 (v2.0)
   - 프로젝트 개요
   - 인증 시스템
   - 교사용 기능 (대시보드, 학생/지문/문제/성적 관리, 통계)
   - 학생용 기능 (학습, 성적, 오답 노트, 순위)
   - 데이터 구조
   - 기술 스택
   - 주요 워크플로우

2. **[database-schema.md](./database-schema.md)** - 데이터베이스 스키마 설계
   - Prisma 스키마 전체 코드
   - 주요 모델 설명
   - 인덱스 전략

3. **[wbs.md](./wbs.md)** - Work Breakdown Structure (작업 분류 및 일정)
   - Phase 1~4 작업 목록
   - 각 Phase별 예상 기간
   - 우선순위

4. **[README.md](./README.md)** - 이 문서
   - 문서 구조 안내
   - 프로젝트 빠른 시작 가이드

---

## 🚀 프로젝트 개요

### 프로젝트명
**국어 학습 통합 시스템**

### 목적
국어 독해력 향상을 위한 웹 기반 학습 시스템으로, 교사와 학생을 위한 통합 플랫폼

### 주요 특징
- 교사와 학생 2개의 사용자 그룹
- 문단별 분석을 통한 독해력 향상
- 실시간 채점 및 피드백
- 복수 정답 지원
- 교사 지정 학습 및 스스로 선택 학습
- 오답 노트 및 성적 추이 분석
- 세부 카테고리 12가지 (비문학 3개, 문학 4개, 문법 6개)

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Form Handling**: React Hook Form + Zod
- **Charts**: recharts

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
  - Provider: Credentials (교사/학생 로그인)

### DevOps
- **Hosting**: Vercel
- **Database**: Neon PostgreSQL
- **Version Control**: Git/GitHub
- **CI/CD**: Vercel Auto Deploy

---

## 📋 핵심 기능

### 교사 기능
- ✅ 대시보드 (통계)
- ✅ 학생 관리 (등록, 수정, 활성화 기간 설정)
- ✅ 지문 관리 (12가지 세부 카테고리)
- ✅ 문제 관리 (복수 정답, 정답 해설)
- ✅ 지문/문제 지정 (학생별/학년별/반별)
- ✅ 성적 조회 및 다운로드
- ✅ 통계 분석 (학생별 성적 그래프, 문제별 정답률)

### 학생 기능
- ✅ 학습하기
  - 스스로 선택 (카테고리, 난이도, 검색)
  - 교사 지정 학습
- ✅ 독해 연습 (타이머, 문단별 질문, 문제 풀이)
- ✅ 문법/개념 풀기
- ✅ 내 성적 (성적 추이 그래프)
- ✅ 오답 노트
- ✅ 순위 (상위 5등, 이름 비공개)

---

## 📅 개발 일정

### 총 예상 기간
**8-12주 (약 2-3개월)**

### Phase 구분
1. **Phase 1**: 기본 인프라 및 인증 (1-2주) ✅
2. **Phase 2**: 교사용 기능 (3-4주)
3. **Phase 3**: 학생용 학습 기능 (3-4주)
4. **Phase 4**: 통계 및 최적화 (1-2주)

자세한 일정은 [wbs.md](./wbs.md)를 참고하세요.

---

## 🎯 MVP (Minimum Viable Product)

### MVP 범위 (Phase 1~3)
- 교사/학생 인증
- 학생 관리
- 지문/문제 관리
- 학습 기능 (독해 연습, 문제 풀기)
- 성적 조회
- 기본 통계

### MVP 이후 추가 기능 (Phase 4+)
- 고급 통계 (AI 기반 분석)
- 협업 기능
- 멀티미디어 지원
- 게이미피케이션

---

## 🗂 주요 데이터 모델

### 인증 관련
- User (사용자)
- Account (NextAuth)
- Session (NextAuth)
- Teacher (교사)
- Student (학생)

### 학습 관련
- Passage (지문)
- Question (문제)
- Result (성적)
- QuestionAnswer (문제별 답변)
- AssignedPassage (교사 지정 지문)
- AssignedQuestion (교사 지정 문제)
- WrongAnswer (오답 노트)

자세한 스키마는 [database-schema.md](./database-schema.md)를 참고하세요.

---

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+ (또는 20+)
- npm 또는 yarn 또는 pnpm
- Neon 계정

### 환경 변수

`.env` 파일 생성 후 다음 변수 설정:

```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Optional: For production
# NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Prisma Client 생성
npx prisma generate

# 데이터베이스 스키마 푸시
npx prisma db push

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

### 색상 (참고 - index.html 기준)
- **Primary**: Purple Gradient (#667eea to #764ba2)
- **Success**: Green
- **Error**: Red
- **Warning**: Orange

### 폰트
- **한글**: Noto Sans KR, Pretendard
- **영문**: Inter, Roboto

---

## 🔒 보안 고려사항

### 인증 / 인가
- NextAuth.js v5 사용 (검증된 라이브러리)
- 비밀번호 bcrypt 해싱
- JWT 토큰 사용
- 교사/학생 권한 구분 (Middleware)

### API
- CORS 설정
- CSRF 방지 (NextAuth.js 기본 제공)
- 입력 검증 (Zod)

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
- Connection Pooling (Neon)

### 캐싱
- ISR (Incremental Static Regeneration)
- React Server Components

---

## 🚢 배포

### Vercel 배포
1. GitHub 저장소 생성 및 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정 (Vercel 대시보드)
4. 자동 배포 완료

### 프로덕션 체크리스트
- [ ] 환경 변수 모두 설정
- [ ] Prisma 스키마 푸시 (`npx prisma db push`)
- [ ] NEXTAUTH_SECRET 변경
- [ ] 도메인 연결 (선택적)
- [ ] HTTPS 확인
- [ ] 최종 테스트

---

## 🤝 향후 확장 가능 기능

### 추가 가능한 기능
- AI 기반 학습 패턴 분석
- 학생 간 토론 게시판
- 오디오 지문 (듣기 평가)
- 비디오 강의 연동
- 배지 및 업적 시스템
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

이 문서들은 국어 학습 통합 시스템 프로젝트의 전체 청사진입니다.

각 문서를 참고하여 체계적으로 개발을 진행하시기 바랍니다.

**화이팅!** 🚀

---

**작성일**: 2025-10-24  
**버전**: 2.0.0  
**프로젝트**: 국어 학습 통합 시스템
