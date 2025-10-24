# 데이터베이스 스키마 설계

## 1. 개요

### 데이터베이스 정보
- **DBMS**: PostgreSQL 14+
- **호스팅**: Supabase
- **ORM**: Prisma
- **인증**: NextAuth.js v5 (Prisma Adapter)

### 주요 테이블 그룹
1. **인증 관련** (NextAuth.js): User, Account, Session, VerificationToken
2. **강의 관련**: Course, Video, CourseFile
3. **결제 관련**: Purchase, Payment, BankTransfer, Receipt, TaxInvoice, Refund
4. **수강 관련**: Enrollment, Progress
5. **기기 관리**: Device
6. **커뮤니티**: Notice
7. **고객센터**: Inquiry, InquiryReply

---

## 2. Prisma 스키마

### 2-1. NextAuth.js 관련 테이블

#### User (사용자)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // 일반 로그인용 (bcrypt 해시)
  phone         String?
  role          Role      @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  purchases     Purchase[]
  enrollments   Enrollment[]
  progresses    Progress[]
  devices       Device[]
  inquiries     Inquiry[]

  @@map("users")
}

enum Role {
  STUDENT
  ADMIN
}
```

#### Account (소셜 로그인 계정)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "oauth", "credentials"
  provider          String  // "google", "kakao", "naver", "credentials"
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}
```

#### Session (세션 - DB 세션 사용 시)
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

#### VerificationToken (이메일 인증 토큰)
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

### 2-2. 강의 관련 테이블

#### Course (강의)
```prisma
model Course {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  price           Int      // 가격 (원 단위)
  thumbnailUrl    String?
  instructorName  String
  instructorIntro String?  @db.Text
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  videos          Video[]
  courseFiles     CourseFile[]
  purchases       Purchase[]
  enrollments     Enrollment[]

  @@map("courses")
}
```

#### Video (영상)
```prisma
model Video {
  id          String   @id @default(cuid())
  courseId    String
  vimeoUrl    String   // Vimeo 영상 URL
  vimeoId     String?  // Vimeo 영상 ID (API 호출용)
  title       String
  description String?  @db.Text
  duration    Int?     // 재생 시간 (초 단위)
  order       Int      // 영상 순서
  isPreview   Boolean  @default(false) // 미리보기 여부
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  course      Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progresses  Progress[]

  @@map("videos")
  @@index([courseId])
}
```

#### CourseFile (강의 자료)
```prisma
model CourseFile {
  id        String   @id @default(cuid())
  courseId  String
  fileName  String
  fileUrl   String   // Supabase Storage URL
  fileSize  Int      // 파일 크기 (bytes)
  createdAt DateTime @default(now())

  // Relations
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@map("course_files")
  @@index([courseId])
}
```

---

### 2-3. 결제 관련 테이블

#### Purchase (구매)
```prisma
model Purchase {
  id        String         @id @default(cuid())
  userId    String
  courseId  String
  amount    Int            // 결제 금액
  status    PurchaseStatus @default(PENDING)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  // Relations
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  course      Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  payment     Payment?
  receipt     Receipt?
  taxInvoice  TaxInvoice?
  refund      Refund?

  @@map("purchases")
  @@index([userId])
  @@index([courseId])
}

enum PurchaseStatus {
  PENDING      // 입금 대기 (무통장입금)
  COMPLETED    // 결제 완료
  CANCELED     // 결제 취소
  REFUNDED     // 환불 완료
}
```

#### Payment (결제 정보)
```prisma
model Payment {
  id          String        @id @default(cuid())
  purchaseId  String        @unique
  paymentKey  String?       @unique // 토스페이먼츠 paymentKey
  orderId     String        @unique // 주문 번호
  method      PaymentMethod // 결제 수단
  status      PaymentStatus @default(PENDING)
  paidAt      DateTime?     // 결제 완료 시각
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  purchase      Purchase       @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  bankTransfer  BankTransfer?

  @@map("payments")
  @@index([paymentKey])
  @@index([orderId])
}

enum PaymentMethod {
  CARD           // 카드 결제
  BANK_TRANSFER  // 무통장입금
}

enum PaymentStatus {
  PENDING    // 대기 (무통장입금)
  COMPLETED  // 완료
  FAILED     // 실패
  CANCELED   // 취소
}
```

#### BankTransfer (무통장입금 정보)
```prisma
model BankTransfer {
  id                  String    @id @default(cuid())
  paymentId           String    @unique
  depositorName       String    // 입금자명
  expectedDepositDate DateTime  // 입금 예정일
  approvedAt          DateTime? // 승인 시각
  rejectedAt          DateTime? // 거절 시각
  rejectReason        String?   @db.Text
  createdAt           DateTime  @default(now())

  // Relations
  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@map("bank_transfers")
}
```

#### Receipt (영수증)
```prisma
model Receipt {
  id            String   @id @default(cuid())
  purchaseId    String   @unique
  receiptNumber String   @unique // 영수증 번호
  issuedAt      DateTime @default(now())

  // Relations
  purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  @@map("receipts")
  @@index([receiptNumber])
}
```

#### TaxInvoice (세금계산서)
```prisma
model TaxInvoice {
  id              String           @id @default(cuid())
  purchaseId      String           @unique
  businessNumber  String           // 사업자등록번호
  companyName     String           // 상호명
  ceoName         String           // 대표자명
  address         String           // 사업장 주소
  businessType    String           // 업태
  businessCategory String          // 종목
  email           String           // 이메일 (발송용)
  issuedAt        DateTime?        // 발행 시각
  status          TaxInvoiceStatus @default(REQUESTED)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  @@map("tax_invoices")
}

enum TaxInvoiceStatus {
  REQUESTED // 발행 요청
  ISSUED    // 발행 완료
}
```

#### Refund (환불)
```prisma
model Refund {
  id           String       @id @default(cuid())
  purchaseId   String       @unique
  reason       String       @db.Text // 환불 사유
  refundAmount Int          // 환불 금액
  accountBank  String?      // 환불 계좌 은행 (무통장입금용)
  accountNumber String?     // 환불 계좌 번호
  accountHolder String?     // 예금주
  status       RefundStatus @default(PENDING)
  requestedAt  DateTime     @default(now())
  processedAt  DateTime?    // 처리 완료 시각
  rejectReason String?      @db.Text

  // Relations
  purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  @@map("refunds")
}

enum RefundStatus {
  PENDING   // 환불 대기
  APPROVED  // 승인
  REJECTED  // 거절
  COMPLETED // 완료
}
```

---

### 2-4. 수강 관련 테이블

#### Enrollment (수강 등록)
```prisma
model Enrollment {
  id         String   @id @default(cuid())
  userId     String
  courseId   String
  enrolledAt DateTime @default(now())

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId]) // 한 사용자가 같은 강의를 중복 수강할 수 없음
  @@map("enrollments")
  @@index([userId])
  @@index([courseId])
}
```

#### Progress (진도율)
```prisma
model Progress {
  id           String    @id @default(cuid())
  userId       String
  videoId      String
  lastPosition Int       @default(0) // 마지막 시청 위치 (초 단위)
  isCompleted  Boolean   @default(false) // 완료 여부
  completedAt  DateTime? // 완료 시각
  updatedAt    DateTime  @updatedAt

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)

  @@unique([userId, videoId]) // 한 사용자의 영상별 진도율은 하나만
  @@map("progresses")
  @@index([userId])
  @@index([videoId])
}
```

---

### 2-5. 기기 관리 테이블

#### Device (등록 기기)
```prisma
model Device {
  id             String   @id @default(cuid())
  userId         String
  deviceId       String   // FingerprintJS 또는 고유 식별자
  deviceName     String   // 예: "Chrome on Windows"
  userAgent      String   @db.Text
  ipAddress      String?
  lastAccessedAt DateTime @default(now())
  createdAt      DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId]) // 같은 기기는 중복 등록 불가
  @@map("devices")
  @@index([userId])
}
```

---

### 2-6. 커뮤니티 테이블

#### Notice (공지사항)
```prisma
model Notice {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  isPinned      Boolean  @default(false) // 중요 공지 (상단 고정)
  views         Int      @default(0)     // 조회수
  attachmentUrl String?  // 첨부파일 URL (Supabase Storage)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("notices")
}
```

---

### 2-7. 고객센터 테이블

#### Inquiry (1:1 문의)
```prisma
model Inquiry {
  id        String        @id @default(cuid())
  userId    String
  title     String
  content   String        @db.Text // Rich Text (HTML)
  isPrivate Boolean       @default(true) // 비밀글 여부
  status    InquiryStatus @default(PENDING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  // Relations
  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  replies InquiryReply[]

  @@map("inquiries")
  @@index([userId])
}

enum InquiryStatus {
  PENDING  // 답변 대기
  ANSWERED // 답변 완료
}
```

#### InquiryReply (문의 답변)
```prisma
model InquiryReply {
  id        String   @id @default(cuid())
  inquiryId String
  adminId   String   // 답변한 관리자 ID (User)
  content   String   @db.Text // Rich Text (HTML)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  inquiry Inquiry @relation(fields: [inquiryId], references: [id], onDelete: Cascade)

  @@map("inquiry_replies")
  @@index([inquiryId])
}
```

---

## 3. 전체 Prisma Schema 파일

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===========================
// NextAuth.js 관련
// ===========================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  phone         String?
  role          Role      @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  purchases     Purchase[]
  enrollments   Enrollment[]
  progresses    Progress[]
  devices       Device[]
  inquiries     Inquiry[]

  @@map("users")
}

enum Role {
  STUDENT
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ===========================
// 강의 관련
// ===========================

model Course {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  price           Int
  thumbnailUrl    String?
  instructorName  String
  instructorIntro String?  @db.Text
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  videos          Video[]
  courseFiles     CourseFile[]
  purchases       Purchase[]
  enrollments     Enrollment[]

  @@map("courses")
}

model Video {
  id          String   @id @default(cuid())
  courseId    String
  vimeoUrl    String
  vimeoId     String?
  title       String
  description String?  @db.Text
  duration    Int?
  order       Int
  isPreview   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course      Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progresses  Progress[]

  @@map("videos")
  @@index([courseId])
}

model CourseFile {
  id        String   @id @default(cuid())
  courseId  String
  fileName  String
  fileUrl   String
  fileSize  Int
  createdAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@map("course_files")
  @@index([courseId])
}

// ===========================
// 결제 관련
// ===========================

model Purchase {
  id        String         @id @default(cuid())
  userId    String
  courseId  String
  amount    Int
  status    PurchaseStatus @default(PENDING)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  course      Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  payment     Payment?
  receipt     Receipt?
  taxInvoice  TaxInvoice?
  refund      Refund?

  @@map("purchases")
  @@index([userId])
  @@index([courseId])
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  CANCELED
  REFUNDED
}

model Payment {
  id          String        @id @default(cuid())
  purchaseId  String        @unique
  paymentKey  String?       @unique
  orderId     String        @unique
  method      PaymentMethod
  status      PaymentStatus @default(PENDING)
  paidAt      DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  purchase      Purchase       @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  bankTransfer  BankTransfer?

  @@map("payments")
  @@index([paymentKey])
  @@index([orderId])
}

enum PaymentMethod {
  CARD
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELED
}

model BankTransfer {
  id                  String    @id @default(cuid())
  paymentId           String    @unique
  depositorName       String
  expectedDepositDate DateTime
  approvedAt          DateTime?
  rejectedAt          DateTime?
  rejectReason        String?   @db.Text
  createdAt           DateTime  @default(now())

  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@map("bank_transfers")
}

model Receipt {
  id            String   @id @default(cuid())
  purchaseId    String   @unique
  receiptNumber String   @unique
  issuedAt      DateTime @default(now())

  purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  @@map("receipts")
  @@index([receiptNumber])
}

model TaxInvoice {
  id              String           @id @default(cuid())
  purchaseId      String           @unique
  businessNumber  String
  companyName     String
  ceoName         String
  address         String
  businessType    String
  businessCategory String
  email           String
  issuedAt        DateTime?
  status          TaxInvoiceStatus @default(REQUESTED)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  @@map("tax_invoices")
}

enum TaxInvoiceStatus {
  REQUESTED
  ISSUED
}

model Refund {
  id           String       @id @default(cuid())
  purchaseId   String       @unique
  reason       String       @db.Text
  refundAmount Int
  accountBank  String?
  accountNumber String?
  accountHolder String?
  status       RefundStatus @default(PENDING)
  requestedAt  DateTime     @default(now())
  processedAt  DateTime?
  rejectReason String?      @db.Text

  purchase Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  @@map("refunds")
}

enum RefundStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}

// ===========================
// 수강 관련
// ===========================

model Enrollment {
  id         String   @id @default(cuid())
  userId     String
  courseId   String
  enrolledAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@map("enrollments")
  @@index([userId])
  @@index([courseId])
}

model Progress {
  id           String    @id @default(cuid())
  userId       String
  videoId      String
  lastPosition Int       @default(0)
  isCompleted  Boolean   @default(false)
  completedAt  DateTime?
  updatedAt    DateTime  @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)

  @@unique([userId, videoId])
  @@map("progresses")
  @@index([userId])
  @@index([videoId])
}

// ===========================
// 기기 관리
// ===========================

model Device {
  id             String   @id @default(cuid())
  userId         String
  deviceId       String
  deviceName     String
  userAgent      String   @db.Text
  ipAddress      String?
  lastAccessedAt DateTime @default(now())
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId])
  @@map("devices")
  @@index([userId])
}

// ===========================
// 커뮤니티
// ===========================

model Notice {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  isPinned      Boolean  @default(false)
  views         Int      @default(0)
  attachmentUrl String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("notices")
}

// ===========================
// 고객센터
// ===========================

model Inquiry {
  id        String        @id @default(cuid())
  userId    String
  title     String
  content   String        @db.Text
  isPrivate Boolean       @default(true)
  status    InquiryStatus @default(PENDING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  replies InquiryReply[]

  @@map("inquiries")
  @@index([userId])
}

enum InquiryStatus {
  PENDING
  ANSWERED
}

model InquiryReply {
  id        String   @id @default(cuid())
  inquiryId String
  adminId   String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inquiry Inquiry @relation(fields: [inquiryId], references: [id], onDelete: Cascade)

  @@map("inquiry_replies")
  @@index([inquiryId])
}
```

---

## 4. ERD (Entity Relationship Diagram)

### 텍스트 기반 ERD

```
User (사용자)
├─ 1:N → Account (소셜 로그인 계정)
├─ 1:N → Session (세션)
├─ 1:N → Purchase (구매)
├─ 1:N → Enrollment (수강 등록)
├─ 1:N → Progress (진도율)
├─ 1:N → Device (등록 기기)
└─ 1:N → Inquiry (1:1 문의)

Course (강의)
├─ 1:N → Video (영상)
├─ 1:N → CourseFile (강의 자료)
├─ 1:N → Purchase (구매)
└─ 1:N → Enrollment (수강 등록)

Purchase (구매)
├─ N:1 → User (사용자)
├─ N:1 → Course (강의)
├─ 1:1 → Payment (결제 정보)
├─ 1:1 → Receipt (영수증) - optional
├─ 1:1 → TaxInvoice (세금계산서) - optional
└─ 1:1 → Refund (환불) - optional

Payment (결제 정보)
├─ 1:1 → Purchase (구매)
└─ 1:1 → BankTransfer (무통장입금 정보) - optional (method = BANK_TRANSFER)

Enrollment (수강 등록)
├─ N:1 → User (사용자)
└─ N:1 → Course (강의)

Progress (진도율)
├─ N:1 → User (사용자)
└─ N:1 → Video (영상)

Inquiry (1:1 문의)
├─ N:1 → User (사용자)
└─ 1:N → InquiryReply (답변)
```

---

## 5. 인덱스 전략

### 주요 인덱스 목록

#### User
- `email` (unique) - 로그인, 중복 검사

#### Account
- `[provider, providerAccountId]` (unique) - 소셜 로그인 조회

#### Video
- `courseId` - 강의별 영상 목록 조회

#### CourseFile
- `courseId` - 강의별 자료 조회

#### Purchase
- `userId` - 사용자별 구매 내역
- `courseId` - 강의별 구매 내역

#### Payment
- `paymentKey` (unique) - 토스페이먼츠 조회
- `orderId` (unique) - 주문 번호 조회

#### Receipt
- `receiptNumber` (unique) - 영수증 번호 조회

#### Enrollment
- `userId` - 사용자별 수강 목록
- `courseId` - 강의별 수강자 목록
- `[userId, courseId]` (unique) - 중복 수강 방지

#### Progress
- `userId` - 사용자별 진도율
- `videoId` - 영상별 진도율
- `[userId, videoId]` (unique) - 중복 진도율 방지

#### Device
- `userId` - 사용자별 기기 목록
- `[userId, deviceId]` (unique) - 중복 기기 방지

#### Inquiry
- `userId` - 사용자별 문의 목록

#### InquiryReply
- `inquiryId` - 문의별 답변 조회

---

## 6. 마이그레이션 전략

### 초기 마이그레이션
```bash
# Prisma 스키마 작성 후
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 마이그레이션 순서
1. NextAuth.js 관련 테이블 (User, Account, Session, VerificationToken)
2. 강의 관련 테이블 (Course, Video, CourseFile)
3. 결제 관련 테이블 (Purchase, Payment, BankTransfer, Receipt, TaxInvoice, Refund)
4. 수강 관련 테이블 (Enrollment, Progress)
5. 기기 관리 테이블 (Device)
6. 커뮤니티 테이블 (Notice)
7. 고객센터 테이블 (Inquiry, InquiryReply)

### 프로덕션 마이그레이션
```bash
# 프로덕션 배포 시
npx prisma migrate deploy
```

---

## 7. Seed 데이터 (개발/테스트용)

### seed.ts 예시
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 관리자 계정 생성
  const hashedPassword = await bcrypt.hash('admin123!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log('Admin created:', admin)

  // 테스트 학생 계정 생성
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Test Student',
      password: hashedPassword,
      role: 'STUDENT',
      emailVerified: new Date(),
    },
  })

  console.log('Student created:', student)

  // 테스트 강의 생성
  const course = await prisma.course.create({
    data: {
      title: '테스트 강의 - JavaScript 기초',
      description: 'JavaScript 기초 문법을 배우는 강의입니다.',
      price: 50000,
      instructorName: 'John Doe',
      instructorIntro: '10년 경력의 풀스택 개발자입니다.',
      isPublished: true,
    },
  })

  console.log('Course created:', course)

  // 테스트 영상 생성
  await prisma.video.createMany({
    data: [
      {
        courseId: course.id,
        vimeoUrl: 'https://vimeo.com/123456789',
        vimeoId: '123456789',
        title: '1강: 변수와 데이터 타입',
        description: '변수 선언 방법과 데이터 타입을 학습합니다.',
        duration: 600,
        order: 1,
        isPreview: true,
      },
      {
        courseId: course.id,
        vimeoUrl: 'https://vimeo.com/987654321',
        vimeoId: '987654321',
        title: '2강: 조건문과 반복문',
        description: 'if, for, while 문을 학습합니다.',
        duration: 720,
        order: 2,
        isPreview: false,
      },
    ],
  })

  console.log('Videos created')

  // 공지사항 생성
  await prisma.notice.create({
    data: {
      title: '사이트 오픈 안내',
      content: '<p>안녕하세요! 사이트가 오픈되었습니다.</p>',
      isPinned: true,
    },
  })

  console.log('Notice created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

### Seed 실행
```bash
# package.json에 추가
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}

# 실행
npx prisma db seed
```

---

## 8. 주요 쿼리 예시

### 사용자 구매 내역 조회
```typescript
const purchases = await prisma.purchase.findMany({
  where: { userId: 'user-id' },
  include: {
    course: true,
    payment: true,
    receipt: true,
  },
  orderBy: { createdAt: 'desc' },
})
```

### 강의 전체 정보 조회 (영상 포함)
```typescript
const course = await prisma.course.findUnique({
  where: { id: 'course-id' },
  include: {
    videos: {
      orderBy: { order: 'asc' },
    },
    courseFiles: true,
  },
})
```

### 사용자 진도율 조회
```typescript
const progresses = await prisma.progress.findMany({
  where: {
    userId: 'user-id',
    video: {
      courseId: 'course-id',
    },
  },
  include: {
    video: true,
  },
})
```

### 전체 진도율 계산
```typescript
// 특정 강의의 전체 영상 수
const totalVideos = await prisma.video.count({
  where: { courseId: 'course-id' },
})

// 완료한 영상 수
const completedVideos = await prisma.progress.count({
  where: {
    userId: 'user-id',
    isCompleted: true,
    video: {
      courseId: 'course-id',
    },
  },
})

const completionRate = (completedVideos / totalVideos) * 100
```

---

## 9. 데이터 정합성 및 제약사항

### Unique 제약
- `User.email`: 이메일 중복 불가
- `Account.[provider, providerAccountId]`: 소셜 계정 중복 불가
- `Enrollment.[userId, courseId]`: 동일 강의 중복 수강 불가
- `Progress.[userId, videoId]`: 영상별 진도율 중복 불가
- `Device.[userId, deviceId]`: 동일 기기 중복 등록 불가

### Cascade Delete
- User 삭제 시 관련 데이터 모두 삭제
  - Account, Session, Purchase, Enrollment, Progress, Device, Inquiry
- Course 삭제 시 관련 데이터 모두 삭제
  - Video, CourseFile, Purchase (주의!), Enrollment
- Purchase 삭제 시 관련 데이터 모두 삭제
  - Payment, Receipt, TaxInvoice, Refund

### 비즈니스 로직 제약 (애플리케이션 레벨)
- 등록 기기는 최대 2개
- 진도율 80% 이상 시 완료 처리
- 구매 완료 후 수강 등록 자동 생성
- 무통장입금 승인 시 수강 등록 생성

---

## 10. 성능 최적화 권장사항

### 1. 인덱스 활용
- 자주 조회하는 필드에 인덱스 추가
- Composite Index 고려 (예: `[userId, courseId]`)

### 2. Select 최적화
```typescript
// 필요한 필드만 선택
const courses = await prisma.course.findMany({
  select: {
    id: true,
    title: true,
    price: true,
    thumbnailUrl: true,
  },
})
```

### 3. Include vs Select
- `include`: 관계 데이터 전체 가져오기
- `select`: 필요한 필드만 선택 (더 효율적)

### 4. Pagination
```typescript
const courses = await prisma.course.findMany({
  skip: (page - 1) * limit,
  take: limit,
})
```

### 5. Connection Pooling
- Supabase에서 기본 제공
- `DATABASE_URL`에 connection pool 설정

---

## 마무리

이 데이터베이스 스키마는 Private LMS 프로젝트의 모든 기능을 지원하도록 설계되었습니다.

다음 단계:
1. `prisma/schema.prisma` 파일에 위 스키마 복사
2. Supabase 데이터베이스 연결 설정 (`.env`)
3. `npx prisma migrate dev --name init` 실행
4. `prisma/seed.ts` 작성 및 실행

문의사항이나 수정 요청이 있으면 언제든지 피드백 주시기 바랍니다.
