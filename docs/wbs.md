# Work Breakdown Structure (WBS)

## 1. 프로젝트 개요

### 프로젝트명
Private LMS (개인 온라인 강의 사이트)

### 전체 기간
**12주 ~ 18주 (약 3개월 ~ 4.5개월)**

### 개발 방식
- 1인 개발
- Agile 방식 (Phase별 반복 개발)
- MVP 우선, 점진적 기능 추가

---

## 2. Phase별 작업 분류

### Phase 1: 기본 인프라 (1-2주)

#### 목표
프로젝트 초기 설정 및 인증 시스템 구축

#### 작업 목록

**1.1 프로젝트 초기 설정 (2일)**
- [x] Next.js 15 프로젝트 생성
- [ ] TypeScript 설정
- [ ] TailwindCSS 설정
- [ ] ESLint, Prettier 설정
- [ ] Git 저장소 초기화
- [ ] .gitignore 설정
- [ ] 환경 변수 설정 (.env.local)

**1.2 데이터베이스 설정 (2일)**
- [ ] Supabase 프로젝트 생성
- [ ] Prisma 설치 및 초기 설정
- [ ] DATABASE_URL 환경 변수 설정
- [ ] Prisma 스키마 작성 (User, Account, Session, VerificationToken)
- [ ] 첫 마이그레이션 실행 (`npx prisma migrate dev --name init`)
- [ ] Prisma Client 생성
- [ ] Prisma Studio 확인

**1.3 NextAuth.js 설정 (3-4일)**
- [ ] NextAuth.js v5 설치
- [ ] Prisma Adapter 설정
- [ ] Credentials Provider 구현 (일반 로그인)
  - [ ] bcrypt 설치 및 비밀번호 해싱
  - [ ] 로그인 로직 구현
- [ ] Google Provider 설정
  - [ ] Google Cloud Console에서 OAuth 클라이언트 생성
  - [ ] 환경 변수 설정
- [ ] Kakao Provider 설정
  - [ ] Kakao Developers에서 앱 생성
  - [ ] 환경 변수 설정
- [ ] Naver Provider 설정
  - [ ] Naver Developers에서 앱 생성
  - [ ] 환경 변수 설정
- [ ] NextAuth API Routes 설정
- [ ] Session 관리 (JWT 또는 DB Session)

**1.4 기본 UI/레이아웃 (2-3일)**
- [ ] 공통 레이아웃 컴포넌트 (Header, Footer)
- [ ] 네비게이션 메뉴
  - [ ] 소개, 강의, 커뮤니티, 고객센터, 마이페이지
  - [ ] 로그인/로그아웃 버튼
- [ ] Shadcn/ui 설치 (선택적) 또는 커스텀 UI 컴포넌트
- [ ] 반응형 디자인 기본 설정

**1.5 인증 페이지 (2-3일)**
- [ ] 로그인 페이지
  - [ ] 이메일/비밀번호 로그인 폼
  - [ ] 소셜 로그인 버튼 (Google, Kakao, Naver)
  - [ ] 로그인 에러 처리
- [ ] 회원가입 페이지
  - [ ] 회원가입 폼 (이름, 이메일, 비밀번호)
  - [ ] 유효성 검사 (React Hook Form + Zod)
  - [ ] 이메일 중복 검사
  - [ ] 비밀번호 강도 체크
  - [ ] 회원가입 성공 시 자동 로그인
- [ ] 비밀번호 찾기 페이지 (선택적)

**1.6 테스트 (1일)**
- [ ] 4가지 로그인 방식 테스트
- [ ] 회원가입 테스트
- [ ] 세션 유지 테스트
- [ ] 로그아웃 테스트

#### Deliverable
- 4가지 로그인 방식 동작 확인
- 기본 레이아웃 완성
- 데이터베이스 연결 완료

---

### Phase 2: 핵심 강의 기능 (3-4주)

#### 목표
강의 목록, 상세, 수강 페이지 구현 및 관리자 강의 관리 기능

#### 작업 목록

**2.1 데이터베이스 스키마 확장 (1일)**
- [ ] Course, Video, CourseFile 모델 추가
- [ ] 마이그레이션 실행
- [ ] Seed 데이터 작성 (테스트용 강의, 영상)

**2.2 강의 목록 페이지 (3-4일)**
- [ ] 강의 목록 조회 API (`/api/courses`)
- [ ] 강의 목록 페이지 UI (`/courses`)
  - [ ] 강의 카드 컴포넌트
  - [ ] 그리드 레이아웃
  - [ ] 반응형 디자인
- [ ] 검색 기능
  - [ ] 제목/설명 검색
  - [ ] 검색 결과 표시
- [ ] 페이지네이션 또는 무한 스크롤 (선택적)
- [ ] 로딩 상태 표시
- [ ] 에러 처리

**2.3 강의 상세 페이지 (4-5일)**
- [ ] 강의 상세 조회 API (`/api/courses/[id]`)
- [ ] 강의 상세 페이지 UI (`/courses/[id]`)
  - [ ] 강의 정보 표시 (제목, 설명, 가격, 강사)
  - [ ] 영상 목록 표시 (제목, 재생 시간, 미리보기 여부)
  - [ ] 강의 자료 목록 표시
  - [ ] 구매 버튼
  - [ ] 이미 구매한 경우 "수강하기" 버튼 표시
- [ ] Vimeo 미리보기 영상 플레이어
  - [ ] Vimeo Player SDK 설치 및 설정
  - [ ] 미리보기 영상 임베드
  - [ ] 재생 제어
- [ ] 구매 여부 확인 로직
- [ ] 로그인하지 않은 경우 로그인 페이지로 리디렉션

**2.4 강의 수강 페이지 (5-6일)**
- [ ] 수강 권한 확인 Middleware 또는 서버 컴포넌트
- [ ] 강의 수강 페이지 UI (`/courses/[id]/learn`)
  - [ ] Vimeo 영상 플레이어 (메인)
  - [ ] 영상 목록 사이드바
  - [ ] 현재 영상 정보 표시
  - [ ] 이전/다음 영상 버튼
- [ ] Vimeo Player SDK 고급 기능
  - [ ] 재생 속도 조절
  - [ ] 화질 선택
  - [ ] 전체화면
  - [ ] 우클릭 방지 (선택적)
- [ ] 영상 전환 기능 (클릭 시 해당 영상 재생)
- [ ] 강의 자료 다운로드 섹션 (기본 UI, 다운로드 기능은 Phase 4)
- [ ] 로딩 상태, 에러 처리

**2.5 관리자 페이지 기본 구조 (2일)**
- [ ] 관리자 전용 레이아웃 (`/admin`)
- [ ] 관리자 권한 확인 Middleware
- [ ] 관리자 사이드바 메뉴
  - [ ] 강의 관리, 학생 관리, 결제 관리, 콘텐츠 관리, 통계
- [ ] 일반 사용자 접근 차단 (403 또는 리디렉션)

**2.6 관리자: 강의 관리 (5-6일)**
- [ ] 강의 목록 페이지 (`/admin/courses`)
  - [ ] 전체 강의 목록 조회
  - [ ] 검색/필터링 (공개/비공개)
  - [ ] "강의 추가" 버튼
  - [ ] 각 강의별 "수정", "삭제" 버튼
- [ ] 강의 생성 페이지 (`/admin/courses/new`)
  - [ ] 강의 정보 입력 폼
  - [ ] 썸네일 이미지 업로드 (Supabase Storage)
  - [ ] 공개/비공개 설정
  - [ ] 저장 API (`POST /api/admin/courses`)
- [ ] 강의 수정 페이지 (`/admin/courses/[id]/edit`)
  - [ ] 기존 강의 정보 불러오기
  - [ ] 수정 폼
  - [ ] 수정 API (`PATCH /api/admin/courses/[id]`)
- [ ] 강의 삭제 API (`DELETE /api/admin/courses/[id]`)
  - [ ] 삭제 확인 다이얼로그
  - [ ] Soft delete 또는 Hard delete

**2.7 관리자: 영상 관리 (5-6일)**
- [ ] 영상 관리 페이지 (`/admin/courses/[id]/videos`)
  - [ ] 해당 강의의 영상 목록
  - [ ] "영상 추가" 버튼
  - [ ] 영상별 "수정", "삭제" 버튼
  - [ ] 순서 변경 (드래그 앤 드롭 또는 위/아래 버튼)
- [ ] 영상 추가 폼
  - [ ] Vimeo URL 입력
  - [ ] 영상 제목, 설명 입력
  - [ ] 미리보기 영상 체크박스
  - [ ] 저장 API (`POST /api/admin/courses/[id]/videos`)
- [ ] Vimeo API 연동 (선택적)
  - [ ] Vimeo URL에서 영상 ID 추출
  - [ ] Vimeo API로 영상 정보 가져오기 (제목, 재생 시간, 썸네일)
- [ ] 영상 순서 변경 API (`PATCH /api/admin/courses/[id]/videos/reorder`)
- [ ] 영상 삭제 API (`DELETE /api/admin/videos/[id]`)
- [ ] 미리보기 영상 지정/해제

**2.8 관리자: 강의 자료 관리 (3-4일)**
- [ ] 강의 자료 관리 페이지 (`/admin/courses/[id]/files`)
  - [ ] 해당 강의의 자료 목록
  - [ ] "파일 업로드" 버튼
  - [ ] 파일별 "삭제" 버튼
- [ ] 파일 업로드
  - [ ] Supabase Storage 연동
  - [ ] 파일 업로드 API (`POST /api/admin/courses/[id]/files`)
  - [ ] 업로드 진행률 표시 (선택적)
- [ ] 파일 삭제 API (`DELETE /api/admin/files/[id]`)
  - [ ] Supabase Storage에서 파일 삭제
  - [ ] DB 레코드 삭제

**2.9 테스트 (2일)**
- [ ] 강의 목록 조회 테스트
- [ ] 강의 상세 조회 테스트
- [ ] 미리보기 영상 재생 테스트
- [ ] 강의 수강 페이지 테스트 (구매자)
- [ ] 관리자: 강의 CRUD 테스트
- [ ] 관리자: 영상 관리 테스트
- [ ] 관리자: 강의 자료 관리 테스트

#### Deliverable
- 사용자: 강의 목록/상세 조회, 미리보기 시청
- 관리자: 강의/영상/자료 관리 기능
- Vimeo 연동 완료

---

### Phase 3: 결제 시스템 (2-3주)

#### 목표
토스페이먼츠 카드 결제, 무통장입금, 영수증, 환불 기능 구현

#### 작업 목록

**3.1 데이터베이스 스키마 확장 (1일)**
- [ ] Purchase, Payment, BankTransfer, Receipt, TaxInvoice, Refund 모델 추가
- [ ] 마이그레이션 실행

**3.2 토스페이먼츠 연동 준비 (1일)**
- [ ] 토스페이먼츠 가입 및 테스트 키 발급
- [ ] 환경 변수 설정 (클라이언트 키, 시크릿 키)
- [ ] `@tosspayments/payment-sdk` 설치 (또는 직접 API 호출)

**3.3 결제 페이지 (3-4일)**
- [ ] 결제 페이지 UI (`/checkout/[courseId]`)
  - [ ] 강의 정보 요약
  - [ ] 결제 수단 선택 (카드/무통장입금)
  - [ ] 구매자 정보 입력 (이름, 이메일, 전화번호)
  - [ ] 구매 동의 체크박스
  - [ ] "결제하기" 버튼 (카드)
  - [ ] "입금 정보 제출" 버튼 (무통장입금)
- [ ] 결제 수단별 UI 토글
- [ ] 유효성 검사

**3.4 카드 결제 (토스페이먼츠) (4-5일)**
- [ ] 결제 요청 API (`POST /api/payments/request`)
  - [ ] Purchase 레코드 생성 (status: PENDING)
  - [ ] Payment 레코드 생성
  - [ ] orderId 생성 (UUID)
  - [ ] 클라이언트에 결제 정보 반환
- [ ] 토스페이먼츠 결제창 호출
  - [ ] 클라이언트에서 토스페이먼츠 SDK 사용
  - [ ] 결제창 띄우기
- [ ] 결제 성공 콜백 처리 (`/checkout/success`)
  - [ ] 쿼리 파라미터에서 paymentKey, orderId, amount 추출
  - [ ] 결제 승인 API (`POST /api/payments/confirm`)
    - [ ] 토스페이먼츠 API로 결제 승인 요청
    - [ ] Payment 상태 "COMPLETED"로 변경
    - [ ] Purchase 상태 "COMPLETED"로 변경
    - [ ] Enrollment 생성 (수강 등록)
    - [ ] Receipt 생성 (영수증)
  - [ ] 결제 완료 페이지 표시
- [ ] 결제 실패 콜백 처리 (`/checkout/fail`)
  - [ ] 실패 사유 표시
  - [ ] 결제 페이지로 복귀 버튼

**3.5 무통장입금 (3-4일)**
- [ ] 무통장입금 정보 입력 폼
  - [ ] 입금자명
  - [ ] 입금 예정일
- [ ] 무통장입금 요청 API (`POST /api/payments/bank-transfer`)
  - [ ] Purchase 생성 (status: PENDING)
  - [ ] Payment 생성 (method: BANK_TRANSFER, status: PENDING)
  - [ ] BankTransfer 생성
  - [ ] 입금 대기 상태로 저장
- [ ] 입금 대기 안내 페이지
  - [ ] 입금 계좌 정보 표시
  - [ ] 입금자명 확인
  - [ ] 관리자 승인 안내

**3.6 관리자: 무통장입금 관리 (3일)**
- [ ] 무통장입금 관리 페이지 (`/admin/payments/bank-transfers`)
  - [ ] 입금 대기 목록 조회
  - [ ] 각 항목별 "승인", "거절" 버튼
- [ ] 입금 승인 API (`POST /api/admin/payments/bank-transfers/[id]/approve`)
  - [ ] Payment 상태 "COMPLETED"로 변경
  - [ ] Purchase 상태 "COMPLETED"로 변경
  - [ ] BankTransfer.approvedAt 설정
  - [ ] Enrollment 생성 (수강 등록)
  - [ ] Receipt 생성
  - [ ] 사용자 알림 (이메일 - 선택적)
- [ ] 입금 거절 API (`POST /api/admin/payments/bank-transfers/[id]/reject`)
  - [ ] 거절 사유 입력
  - [ ] Payment 상태 유지 또는 "CANCELED"로 변경
  - [ ] BankTransfer.rejectedAt, rejectReason 설정
  - [ ] 사용자 알림

**3.7 영수증 (2-3일)**
- [ ] 영수증 조회 페이지 (`/receipts/[id]`)
  - [ ] 영수증 정보 표시
  - [ ] PDF 다운로드 버튼 (선택적 - react-pdf)
  - [ ] 인쇄 버튼
- [ ] 영수증 조회 API (`GET /api/receipts/[id]`)
- [ ] PDF 생성 (선택적)
  - [ ] react-pdf 또는 puppeteer 사용
  - [ ] 영수증 템플릿 디자인

**3.8 환불 (3-4일)**
- [ ] 환불 신청 페이지 (`/refunds/request/[purchaseId]`)
  - [ ] 환불 사유 입력
  - [ ] 환불 계좌 정보 입력 (무통장입금용)
  - [ ] 환불 신청 API (`POST /api/refunds`)
    - [ ] Refund 레코드 생성 (status: PENDING)
- [ ] 관리자: 환불 관리 페이지 (`/admin/refunds`)
  - [ ] 환불 신청 목록
  - [ ] 각 항목별 "승인", "거절" 버튼
- [ ] 환불 승인 API (`POST /api/admin/refunds/[id]/approve`)
  - [ ] 카드 결제: 토스페이먼츠 결제 취소 API 호출
  - [ ] 무통장입금: 수동 환불 처리 안내
  - [ ] Refund 상태 "COMPLETED"로 변경
  - [ ] Purchase 상태 "REFUNDED"로 변경
  - [ ] Enrollment 삭제 또는 상태 변경
  - [ ] 사용자 알림
- [ ] 환불 거절 API (`POST /api/admin/refunds/[id]/reject`)
  - [ ] 거절 사유 입력
  - [ ] Refund 상태 "REJECTED"로 변경
  - [ ] 사용자 알림

**3.9 마이페이지: 결제 내역 (2-3일)**
- [ ] 결제 내역 페이지 (`/mypage/payments`)
  - [ ] 구매한 강의 목록
  - [ ] 결제 정보 (날짜, 금액, 수단, 상태)
  - [ ] 영수증 조회 버튼
  - [ ] 환불 신청 버튼 (가능한 경우)
- [ ] 결제 내역 조회 API (`GET /api/users/me/payments`)
- [ ] 필터링 (결제 상태별)

**3.10 테스트 (2일)**
- [ ] 카드 결제 테스트 (토스페이먼츠 테스트 키)
- [ ] 무통장입금 테스트
- [ ] 관리자: 입금 승인/거절 테스트
- [ ] 영수증 조회/출력 테스트
- [ ] 환불 신청/승인/거절 테스트
- [ ] 결제 후 수강 등록 확인

#### Deliverable
- 카드 결제 및 무통장입금 기능
- 결제 후 강의 수강 가능
- 영수증 발급
- 환불 기본 기능

---

### Phase 4: 진도율 및 학습 관리 (1-2주)

#### 목표
진도율 추적, 이어보기, 강의 자료 다운로드 기능 구현

#### 작업 목록

**4.1 데이터베이스 스키마 확장 (1일)**
- [ ] Enrollment, Progress 모델 추가 (이미 Phase 3에서 추가되었을 수 있음)
- [ ] 마이그레이션 실행

**4.2 진도율 시스템 (4-5일)**
- [ ] Vimeo Player API 이벤트 리스너 설정
  - [ ] `timeupdate`: 재생 시간 추적
  - [ ] `ended`: 영상 종료 이벤트
- [ ] 재생 위치 저장 API (`POST /api/progress`)
  - [ ] 주기적으로 현재 재생 위치 저장 (예: 10초마다)
  - [ ] Progress 레코드 upsert (없으면 생성, 있으면 업데이트)
  - [ ] lastPosition 업데이트
- [ ] 완료 처리 로직
  - [ ] 영상 80% 이상 시청 시 isCompleted = true
  - [ ] completedAt 설정
- [ ] 진도율 조회 API (`GET /api/courses/[id]/progress`)
  - [ ] 전체 영상 수
  - [ ] 완료한 영상 수
  - [ ] 진도율 퍼센트 계산
  - [ ] 각 영상별 진도율 정보

**4.3 이어보기 기능 (2일)**
- [ ] 영상 재생 시 마지막 시청 위치 불러오기
- [ ] "이어보기" 또는 "처음부터" 선택 옵션 (선택적)
- [ ] Vimeo Player에서 마지막 위치로 이동 (`player.setCurrentTime()`)

**4.4 강의 수강 페이지 진도율 표시 (2일)**
- [ ] 전체 진도율 표시 (진행 바 + 퍼센트)
- [ ] 영상 목록에서 완료한 영상 체크 아이콘 표시
- [ ] 현재 영상 진도율 표시 (선택적)

**4.5 마이페이지: 내 강의실 (3-4일)**
- [ ] 내 강의실 페이지 (`/mypage/courses`)
  - [ ] 수강 중인 강의 목록
  - [ ] 각 강의별 진도율 표시 (진행 바 + 퍼센트)
  - [ ] 완료한 영상 수 / 전체 영상 수
  - [ ] 마지막 학습일
  - [ ] "수강하기" 버튼
- [ ] 내 강의실 조회 API (`GET /api/users/me/courses`)
  - [ ] Enrollment 조회
  - [ ] 각 강의별 진도율 계산
  - [ ] 마지막 시청 영상 정보

**4.6 강의 자료 다운로드 (2-3일)**
- [ ] 강의 상세 페이지에서 자료 목록 표시 (이미 Phase 2에서 구현)
- [ ] 강의 수강 페이지에서 자료 다운로드 섹션 추가
- [ ] 다운로드 권한 확인 (구매자만)
- [ ] 파일 다운로드 API (`GET /api/courses/[id]/files/[fileId]/download`)
  - [ ] Supabase Storage에서 파일 URL 생성
  - [ ] 또는 직접 파일 스트리밍
- [ ] 다운로드 버튼 클릭 시 파일 다운로드

**4.7 테스트 (1-2일)**
- [ ] 영상 시청 시 진도율 저장 테스트
- [ ] 완료 처리 테스트 (80% 이상 시청)
- [ ] 이어보기 기능 테스트
- [ ] 내 강의실 진도율 표시 테스트
- [ ] 강의 자료 다운로드 테스트

#### Deliverable
- 진도율 추적 및 표시
- 이어보기 기능
- 내 강의실 완성
- 강의 자료 다운로드

---

### Phase 5: 부가 기능 (2-3주)

#### 목표
등록기기 관리, 공지사항, 1:1 문의, 세금계산서 기능 구현

#### 작업 목록

**5.1 등록기기 관리 (4-5일)**
- [ ] 데이터베이스 스키마: Device 모델 추가 (이미 추가되었을 수 있음)
- [ ] FingerprintJS 설치 및 설정
  - [ ] `@fingerprintjs/fingerprintjs` 설치
  - [ ] 클라이언트에서 기기 ID 생성
- [ ] 기기 등록 API (`POST /api/devices`)
  - [ ] 강의 수강 페이지 접속 시 자동 호출
  - [ ] 사용자의 등록 기기 수 확인
  - [ ] 2개 미만: 새 기기 등록
  - [ ] 2개 이상: 에러 반환 (접근 차단)
- [ ] 접근 차단 처리
  - [ ] 기기 초과 시 안내 페이지 표시
  - [ ] 기존 기기 목록 표시
  - [ ] 마이페이지로 이동 안내
- [ ] 마이페이지: 등록기기 관리 (`/mypage/devices`)
  - [ ] 등록된 기기 목록 조회 API (`GET /api/users/me/devices`)
  - [ ] 각 기기 정보 표시 (기기명, 등록일, 마지막 접속일)
  - [ ] 기기 해제 API (`DELETE /api/devices/[id]`)
  - [ ] 현재 기기 하이라이트
- [ ] 관리자: 기기 관리
  - [ ] 사용자별 등록 기기 조회 (`/admin/users/[id]/devices`)
  - [ ] 관리자 강제 해제 API (`DELETE /api/admin/devices/[id]`)

**5.2 공지사항 (4-5일)**
- [ ] 데이터베이스 스키마: Notice 모델 추가
- [ ] 공지사항 목록 페이지 (`/notices`)
  - [ ] 공지사항 목록 조회 API (`GET /api/notices`)
  - [ ] 중요 공지 상단 고정
  - [ ] 페이지네이션
- [ ] 공지사항 상세 페이지 (`/notices/[id]`)
  - [ ] 공지사항 상세 조회 API (`GET /api/notices/[id]`)
  - [ ] 조회수 증가
  - [ ] 첨부파일 다운로드
- [ ] 관리자: 공지사항 관리 (`/admin/notices`)
  - [ ] 공지사항 목록
  - [ ] "공지사항 작성" 버튼
- [ ] 관리자: 공지사항 작성 (`/admin/notices/new`)
  - [ ] 제목, 내용 입력 (Rich Text 에디터 - 선택적)
  - [ ] 첨부파일 업로드 (Supabase Storage)
  - [ ] 중요 공지 체크박스
  - [ ] 작성 API (`POST /api/admin/notices`)
- [ ] 관리자: 공지사항 수정 (`/admin/notices/[id]/edit`)
  - [ ] 수정 API (`PATCH /api/admin/notices/[id]`)
- [ ] 관리자: 공지사항 삭제
  - [ ] 삭제 API (`DELETE /api/admin/notices/[id]`)

**5.3 1:1 문의 (Tiptap) (5-6일)**
- [ ] 데이터베이스 스키마: Inquiry, InquiryReply 모델 추가
- [ ] Tiptap 설치 및 설정
  - [ ] `@tiptap/react`, `@tiptap/starter-kit` 설치
  - [ ] 기본 에디터 컴포넌트 생성
  - [ ] 이미지 업로드 기능 추가
- [ ] 사용자: 문의 작성 페이지 (`/inquiries/new`)
  - [ ] 제목 입력
  - [ ] Tiptap 에디터 (내용 입력)
  - [ ] 이미지 업로드 (Supabase Storage)
  - [ ] 비밀글 체크박스
  - [ ] 문의 작성 API (`POST /api/inquiries`)
- [ ] 사용자: 문의 목록 페이지 (`/mypage/inquiries`)
  - [ ] 내 문의 목록 조회 API (`GET /api/users/me/inquiries`)
  - [ ] 제목, 작성일, 답변 상태
- [ ] 사용자: 문의 상세 페이지 (`/inquiries/[id]`)
  - [ ] 문의 상세 조회 API (`GET /api/inquiries/[id]`)
  - [ ] 문의 내용 (Rich Text 렌더링)
  - [ ] 관리자 답변 표시
  - [ ] 수정/삭제 버튼 (답변 전)
- [ ] 관리자: 문의 관리 (`/admin/inquiries`)
  - [ ] 전체 문의 목록 조회 API (`GET /api/admin/inquiries`)
  - [ ] 필터링 (답변 상태)
  - [ ] 각 문의 클릭 → 상세 페이지
- [ ] 관리자: 문의 상세 및 답변 (`/admin/inquiries/[id]`)
  - [ ] 문의 내용 표시
  - [ ] Tiptap 에디터 (답변 작성)
  - [ ] 이미지 업로드
  - [ ] 답변 등록 API (`POST /api/admin/inquiries/[id]/reply`)
    - [ ] InquiryReply 생성
    - [ ] Inquiry 상태 "ANSWERED"로 변경
  - [ ] 답변 수정/삭제 API

**5.4 세금계산서 발급 (3-4일)**
- [ ] 데이터베이스 스키마: TaxInvoice 모델 추가 (이미 Phase 3에서 추가)
- [ ] 마이페이지: 세금계산서 발급 요청 (`/mypage/payments/[purchaseId]/tax-invoice`)
  - [ ] 사업자 정보 입력 폼
  - [ ] 발급 요청 API (`POST /api/tax-invoices`)
    - [ ] TaxInvoice 레코드 생성 (status: REQUESTED)
- [ ] 관리자: 세금계산서 관리 (`/admin/tax-invoices`)
  - [ ] 발급 요청 목록 조회
  - [ ] 각 요청 상세 정보
  - [ ] "발행" 버튼
- [ ] 관리자: 세금계산서 발행
  - [ ] 발행 처리 API (`POST /api/admin/tax-invoices/[id]/issue`)
    - [ ] TaxInvoice 상태 "ISSUED"로 변경
    - [ ] issuedAt 설정
  - [ ] 수동 발행 안내 (회계 프로그램 사용)
  - [ ] 또는 API 연동 (선택적 - 더존, 세무서 API)
- [ ] 사용자: 세금계산서 조회/다운로드
  - [ ] 마이페이지 결제 내역에서 조회
  - [ ] PDF 다운로드 (선택적)

**5.5 테스트 (2일)**
- [ ] 등록기기 등록/제한 테스트
- [ ] 기기 해제 테스트
- [ ] 공지사항 CRUD 테스트
- [ ] 1:1 문의 작성/답변 테스트
- [ ] Tiptap 이미지 업로드 테스트
- [ ] 세금계산서 발급 요청/발행 테스트

#### Deliverable
- 등록기기 관리 완료
- 공지사항 기능
- 1:1 문의 기능 (리치 텍스트)
- 세금계산서 발급

---

### Phase 6: 관리자 고도화 (2주)

#### 목표
회원 관리, 결제 관리 강화, 통계/리포트 대시보드 구현

#### 작업 목록

**6.1 관리자: 회원 관리 (4-5일)**
- [ ] 회원 목록 페이지 (`/admin/users`)
  - [ ] 전체 회원 목록 조회 API (`GET /api/admin/users`)
  - [ ] 검색 (이름, 이메일)
  - [ ] 필터링 (가입 방법, 회원 상태)
  - [ ] 정렬 (가입일, 이름)
  - [ ] 페이지네이션
- [ ] 회원 상세 페이지 (`/admin/users/[id]`)
  - [ ] 회원 정보 조회 API (`GET /api/admin/users/[id]`)
  - [ ] 프로필 정보
  - [ ] 가입일, 가입 방법
  - [ ] 수강 현황 (구매한 강의, 진도율)
  - [ ] 결제 내역
  - [ ] 등록 기기 목록
- [ ] 회원 상태 관리
  - [ ] 회원 정지 API (`POST /api/admin/users/[id]/suspend`)
    - [ ] 정지 사유 입력
    - [ ] User 상태 변경 (선택적 - status 필드 추가)
  - [ ] 회원 정지 해제 API (`POST /api/admin/users/[id]/unsuspend`)
  - [ ] 회원 삭제 (탈퇴 처리) API (`DELETE /api/admin/users/[id]`)
- [ ] 등록 기기 조회 및 해제 (Phase 5에서 일부 구현)

**6.2 관리자: 결제 관리 강화 (3-4일)**
- [ ] 전체 결제 내역 페이지 (`/admin/payments`)
  - [ ] 전체 결제 내역 조회 API (`GET /api/admin/payments`)
  - [ ] 필터링 (결제 수단, 결제 상태, 날짜 범위)
  - [ ] 정렬 (결제일, 금액)
  - [ ] 페이지네이션
  - [ ] 통계 요약 (총 결제 건수, 총 결제 금액)
- [ ] 결제 상세 정보 모달 또는 페이지
  - [ ] 학생 정보, 강의 정보, 결제 정보
- [ ] 무통장입금 관리 UI 개선 (Phase 3에서 기본 구현)
  - [ ] 입금 대기 알림 배지
  - [ ] 빠른 승인/거절 버튼
- [ ] 환불 관리 UI 개선 (Phase 3에서 기본 구현)
  - [ ] 환불 신청 알림 배지
  - [ ] 환불 정책 자동 확인 (진도율, 수강 시작일 등)

**6.3 관리자: 통계/리포트 대시보드 (5-6일)**
- [ ] 대시보드 메인 페이지 (`/admin/dashboard`)
  - [ ] 개요 카드
    - [ ] 총 회원 수 (`SELECT COUNT(*) FROM users WHERE role = 'STUDENT'`)
    - [ ] 신규 가입자 (오늘/이번 주/이번 달)
    - [ ] 총 강의 수
    - [ ] 총 매출 (누적)
    - [ ] 오늘/이번 주/이번 달 매출
    - [ ] 총 구매 건수
  - [ ] 대시보드 조회 API (`GET /api/admin/dashboard`)
- [ ] 최근 활동
  - [ ] 최근 가입한 회원 (5명)
  - [ ] 최근 결제 내역 (5건)
  - [ ] 최근 문의 (5건)
- [ ] 인기 강의 TOP 5
  - [ ] 구매 수 기준 상위 5개 강의
  - [ ] 각 강의별 구매 수, 매출
- [ ] 차트 (선택적 - Recharts, Chart.js 등)
  - [ ] 일별/주별/월별 매출 그래프
  - [ ] 일별/주별/월별 가입자 수 그래프

**6.4 관리자: 매출 통계 (3-4일)**
- [ ] 매출 통계 페이지 (`/admin/stats/revenue`)
  - [ ] 기간별 매출 조회 API (`GET /api/admin/stats/revenue`)
  - [ ] 날짜 범위 선택 (시작일 ~ 종료일)
  - [ ] 총 매출 표시
  - [ ] 일별/주별/월별 매출 그래프 (선택적)
- [ ] 강의별 매출
  - [ ] 각 강의별 총 매출, 구매 건수
  - [ ] 테이블 또는 차트
- [ ] 결제 수단별 매출
  - [ ] 카드 결제 매출
  - [ ] 무통장입금 매출
  - [ ] 비율 (파이 차트 - 선택적)
- [ ] 환불률
  - [ ] 전체 구매 건수 대비 환불 건수
  - [ ] 환불 금액

**6.5 관리자: 수강 통계 (2-3일)**
- [ ] 수강 통계 페이지 (`/admin/stats/enrollment`)
  - [ ] 수강 통계 조회 API (`GET /api/admin/stats/enrollment`)
  - [ ] 강의별 수강 인원
  - [ ] 강의별 평균 진도율
  - [ ] 수강 완료율 (진도율 100% 인원 / 전체 수강 인원)
- [ ] 학습 활동 (선택적)
  - [ ] 일별/주별 활성 사용자 수 (DAU/WAU)
  - [ ] 일별/주별 영상 재생 횟수

**6.6 테스트 (1-2일)**
- [ ] 회원 관리 테스트 (목록, 상세, 정지, 삭제)
- [ ] 결제 관리 테스트 (목록, 필터링)
- [ ] 대시보드 통계 확인
- [ ] 매출 통계 조회
- [ ] 수강 통계 조회

#### Deliverable
- 관리자 페이지 완성
- 회원 관리 기능
- 결제 관리 강화
- 통계 대시보드

---

### Phase 7: 최적화 및 배포 (1-2주)

#### 목표
성능 최적화, SEO, 배포 및 최종 테스트

#### 작업 목록

**7.1 성능 최적화 (3-4일)**
- [ ] 이미지 최적화
  - [ ] Next.js Image 컴포넌트 적용
  - [ ] 적절한 이미지 크기 설정
  - [ ] WebP 포맷 사용
- [ ] 코드 스플리팅
  - [ ] Dynamic Import 활용
  - [ ] 무거운 라이브러리 지연 로딩 (Tiptap, Chart.js 등)
- [ ] 캐싱 전략
  - [ ] ISR (Incremental Static Regeneration) 활용
  - [ ] SWR 또는 React Query 도입 (선택적)
- [ ] 데이터베이스 쿼리 최적화
  - [ ] N+1 문제 해결 (Prisma include 활용)
  - [ ] 인덱스 추가 (자주 조회하는 필드)
  - [ ] 쿼리 성능 측정 (Prisma logging)
- [ ] Lighthouse 성능 측정
  - [ ] Performance, Accessibility, Best Practices, SEO 점수 확인
  - [ ] 개선 사항 적용

**7.2 SEO 최적화 (2-3일)**
- [ ] 메타 태그 설정
  - [ ] 각 페이지별 title, description
  - [ ] Open Graph 태그 (og:title, og:description, og:image)
  - [ ] Twitter Card 태그
- [ ] sitemap.xml 생성
  - [ ] Next.js API Route로 동적 생성 또는 정적 생성
  - [ ] 강의 목록, 공지사항 등 포함
- [ ] robots.txt 설정
  - [ ] 크롤링 허용/차단 설정
- [ ] 구조화된 데이터 (선택적)
  - [ ] JSON-LD (Course, Organization 등)

**7.3 반응형 디자인 완성 (2-3일)**
- [ ] 모바일 뷰 최적화
  - [ ] 네비게이션 햄버거 메뉴
  - [ ] 강의 카드 레이아웃
  - [ ] 강의 수강 페이지 (영상 플레이어 + 목록)
- [ ] 태블릿 뷰 최적화
- [ ] 데스크톱 뷰 확인
- [ ] 크로스 브라우저 테스트
  - [ ] Chrome, Safari, Firefox, Edge

**7.4 에러 핸들링 및 로깅 (2일)**
- [ ] 에러 바운더리 (Error Boundary)
  - [ ] 전역 에러 처리
  - [ ] 사용자 친화적인 에러 메시지
- [ ] API 에러 핸들링
  - [ ] 400, 401, 403, 404, 500 등 상태 코드별 처리
  - [ ] 에러 메시지 표시
- [ ] 로깅 시스템 (선택적)
  - [ ] Sentry 연동 (에러 추적)
  - [ ] 또는 Winston, Pino 등 로깅 라이브러리

**7.5 배포 준비 (2-3일)**
- [ ] 환경 변수 정리
  - [ ] `.env.example` 작성
  - [ ] Production 환경 변수 확인
- [ ] Vercel 프로젝트 생성
  - [ ] GitHub 저장소 연결
  - [ ] 환경 변수 설정 (Vercel 대시보드)
- [ ] 도메인 연결 (선택적)
  - [ ] 커스텀 도메인 설정
  - [ ] DNS 설정
- [ ] HTTPS 설정 (Vercel 자동 제공)
- [ ] Prisma 마이그레이션 (Production)
  - [ ] `npx prisma migrate deploy` 실행
- [ ] Supabase 프로덕션 설정
  - [ ] Connection Pooling 확인
  - [ ] Supabase Storage 권한 설정

**7.6 최종 테스트 (2-3일)**
- [ ] 전체 기능 통합 테스트
  - [ ] 회원가입 → 로그인 → 강의 조회 → 결제 → 수강 → 진도율 → 환불
  - [ ] 관리자: 강의 생성 → 영상 추가 → 무통장입금 승인 → 통계 확인
- [ ] 사용자 시나리오 테스트
  - [ ] 일반 사용자 시나리오
  - [ ] 관리자 시나리오
- [ ] 모바일 테스트
- [ ] 성능 테스트
  - [ ] 로딩 속도
  - [ ] 영상 재생 성능
- [ ] 버그 수정
- [ ] 최종 배포

**7.7 문서 작성 (1-2일)**
- [ ] README.md 업데이트
  - [ ] 프로젝트 설명
  - [ ] 기술 스택
  - [ ] 설치 및 실행 방법
  - [ ] 환경 변수 설정
- [ ] 사용자 가이드 (선택적)
- [ ] 관리자 가이드 (선택적)

#### Deliverable
- 최적화된 성능
- SEO 최적화 완료
- 배포 완료 (Production)
- 안정적인 서비스 운영

---

## 3. 전체 일정 요약

| Phase | 작업 내용 | 예상 기간 | 누적 기간 |
|-------|-----------|-----------|-----------|
| Phase 1 | 기본 인프라 | 1-2주 | 1-2주 |
| Phase 2 | 핵심 강의 기능 | 3-4주 | 4-6주 |
| Phase 3 | 결제 시스템 | 2-3주 | 6-9주 |
| Phase 4 | 진도율 및 학습 관리 | 1-2주 | 7-11주 |
| Phase 5 | 부가 기능 | 2-3주 | 9-14주 |
| Phase 6 | 관리자 고도화 | 2주 | 11-16주 |
| Phase 7 | 최적화 및 배포 | 1-2주 | 12-18주 |

**총 예상 기간: 12-18주 (약 3-4.5개월)**

---

## 4. 우선순위

### Must Have (필수)
- Phase 1: 기본 인프라
- Phase 2: 핵심 강의 기능
- Phase 3: 결제 시스템 (카드 결제, 무통장입금)
- Phase 4: 진도율 시스템

### Should Have (중요)
- Phase 5: 부가 기능 (등록기기, 공지사항, 1:1 문의)
- Phase 6: 관리자 고도화 (회원 관리, 통계)

### Could Have (선택적)
- Phase 7: 최적화 (일부는 필수, 일부는 선택)
  - 필수: 기본 SEO, 배포
  - 선택: 고급 최적화, 로깅 시스템

---

## 5. 리스크 관리

### 주요 리스크

**1. 토스페이먼츠 연동 복잡도**
- 리스크: 결제 연동 시 예상보다 시간이 오래 걸릴 수 있음
- 대응: 토스페이먼츠 공식 문서 및 샘플 코드 사전 학습, 충분한 테스트 시간 확보

**2. Vimeo API 제한**
- 리스크: Vimeo Starter 플랜의 API 호출 제한
- 대응: API 호출 최소화, 캐싱 활용

**3. 등록기기 관리 복잡도**
- 리스크: 기기 Fingerprinting이 정확하지 않을 수 있음
- 대응: FingerprintJS Pro 고려 (유료), 또는 간단한 방식 (User Agent + IP)

**4. 1인 개발로 인한 시간 지연**
- 리스크: 예상보다 개발 기간이 길어질 수 있음
- 대응: Phase별로 MVP 우선, 선택적 기능은 추후 추가

**5. 성능 이슈**
- 리스크: 사용자 증가 시 성능 저하
- 대응: 초기 설계 시 확장성 고려, 캐싱 전략, 데이터베이스 인덱싱

---

## 6. 다음 단계

WBS 작성 완료 후:

1. **Phase 1 시작**
   - 프로젝트 초기 설정
   - NextAuth.js 설정
   - 기본 UI/레이아웃

2. **일일/주간 진행 상황 체크**
   - 각 작업 완료 여부 체크
   - 예상 기간과 실제 소요 기간 비교
   - 필요 시 일정 조정

3. **Phase별 회고**
   - 각 Phase 완료 후 회고
   - 개선 사항 도출
   - 다음 Phase에 반영

---

## 마무리

이 WBS는 Private LMS 프로젝트의 전체 작업을 Phase별로 체계적으로 정리한 문서입니다.

각 Phase별로 명확한 목표와 작업 목록, 예상 기간이 정의되어 있어 개발을 효율적으로 진행할 수 있습니다.

개발 진행 중 상황에 따라 유연하게 조정하면서 진행하시기 바랍니다.

**화이팅!** 🚀
