# 국어 학습 통합 시스템 - 데이터베이스 스키마

## 개요

이 문서는 국어 학습 통합 시스템의 데이터베이스 스키마를 설명합니다.

### 데이터베이스 정보
- **ORM**: Prisma
- **Database**: Neon PostgreSQL
- **Schema Version**: v2.0

---

## 전체 ERD 구조

```
User (사용자 기본 정보)
├── Teacher (교사 정보)
└── Student (학생 정보)
    ├── Result (성적)
    │   └── QuestionAnswer (문제별 답변)
    ├── AssignedPassage (교사 지정 지문)
    ├── AssignedQuestion (교사 지정 문제)
    └── WrongAnswer (오답 노트)

Passage (지문)
├── Question (문제)
│   ├── QuestionAnswer (문제별 답변)
│   ├── AssignedQuestion (교사 지정)
│   └── WrongAnswer (오답 노트)
├── Result (성적)
└── AssignedPassage (교사 지정)
```

---

## 주요 모델 설명

### 1. 인증 관련 모델

#### User
사용자 기본 정보 (NextAuth.js 표준)

**주요 필드**
- `id`: 사용자 고유 ID (cuid)
- `email`: 이메일 (로그인용)
- `password`: bcrypt 해시된 비밀번호
- `role`: 역할 (STUDENT, TEACHER, ADMIN)

**관계**
- Teacher (1:1) - 교사 상세 정보
- Student (1:1) - 학생 상세 정보
- Account (1:N) - NextAuth 계정 정보
- Session (1:N) - NextAuth 세션

#### Teacher
교사 정보

**주요 필드**
- `teacherId`: 교사 ID (고유 식별자, 예: T001)
- `name`: 교사 이름

#### Student
학생 정보

**주요 필드**
- `studentId`: 학번 (예: 030201 = 3학년 2반 1번)
- `name`: 학생 이름
- `grade`: 학년 (1, 2, 3)
- `class`: 반
- `number`: 번호
- `isActive`: 활성화 여부
- `activationStartDate`: 활성화 시작일 (v2.0 신규)
- `activationEndDate`: 활성화 종료일 (v2.0 신규)

**특징**
- 활성화 기간이 지나면 자동으로 로그인 불가
- 삭제 대신 `isActive`를 false로 설정

---

### 2. 학습 컨텐츠 모델

#### Passage
지문 정보

**주요 필드**
- `title`: 지문 제목
- `category`: 대분류 카테고리 (비문학, 문학, 문법)
- `subcategory`: 세부 카테고리 (v2.0 신규)
  - 비문학: 인문예술, 과학기술, 사회문화
  - 문학: 고전산문, 고전시가, 현대산문, 현대시
  - 문법: 품사, 단어의 형성, 음운 변동, 문장, 한글맞춤법, 중세 국어
- `difficulty`: 난이도 (중학교, 고1-2, 고3)
- `contentBlocks`: 문단별 내용 (JSON)
  ```json
  [
    {
      "para": "문단 내용",
      "q": "문단별 질문",
      "a": "정답",
      "explanation": "정답 해설"
    }
  ]
  ```

**검색 및 필터링**
- 제목 검색
- 대분류/세부 카테고리별 필터
- 난이도별 필터

#### Question
문제 정보

**주요 필드**
- `passageId`: 연결된 지문 ID (null이면 문법/개념 독립 문제)
- `type`: 문제 유형 (객관식, 단답형, 서술형)
- `text`: 문제 내용
- `options`: 선택지 (JSON, 객관식인 경우)
- `answers`: 정답 배열 (v2.0: 복수 정답 지원)
- `explanation`: 정답 해설
- `wrongAnswerExplanations`: 오답 선택지별 해설 (JSON, v2.0 신규)

**복수 정답 지원 (v2.0)**
- `answers` 필드를 String[]로 변경
- 여러 정답을 배열로 저장
- 학생이 제출한 답이 배열 안에 있으면 정답 처리

---

### 3. 학습 기록 모델

#### Result
학생의 지문 학습 결과

**주요 필드**
- `studentId`: 학생 ID
- `passageId`: 지문 ID
- `readingTime`: 독해 시간 (초)
- `score`: 총점 (0-100)
- `paragraphAnswers`: 문단별 질문 답변 (JSON)
- `isAssigned`: 교사 지정 여부 (v2.0 신규)
- `submittedAt`: 제출 일시

**인덱스**
- studentId (학생별 조회 최적화)
- passageId (지문별 조회 최적화)

#### QuestionAnswer
문제별 답변 기록

**주요 필드**
- `resultId`: 성적 ID
- `questionId`: 문제 ID
- `answer`: 학생 답변
- `isCorrect`: 정답 여부

**특징**
- Result와 Question을 연결하는 조인 테이블
- 문제별 정답률 통계에 활용

---

### 4. 교사 지정 모델 (v2.0 신규)

#### AssignedPassage
교사가 학생에게 지정한 지문

**주요 필드**
- `passageId`: 지정된 지문 ID
- `assignedBy`: 교사 ID
- `assignedTo`: 학생 ID (null이면 학년/반 전체)
- `targetGrade`: 대상 학년
- `targetClass`: 대상 반
- `dueDate`: 완료 기한
- `createdAt`: 지정 일시

**특징**
- 개별 학생 또는 학년/반 전체에 지정 가능
- `assignedTo`가 null이면 targetGrade/targetClass 기준으로 지정
- 학생의 "지정된 학습" 탭에 표시

**인덱스**
- passageId
- assignedTo
- [targetGrade, targetClass] (복합 인덱스)

#### AssignedQuestion
교사가 학생에게 지정한 문제 (문법/개념)

**주요 필드**
- `questionId`: 지정된 문제 ID
- `assignedBy`: 교사 ID
- `assignedTo`: 학생 ID (null이면 학년/반 전체)
- `targetGrade`: 대상 학년
- `targetClass`: 대상 반
- `dueDate`: 완료 기한
- `createdAt`: 지정 일시

**특징**
- AssignedPassage와 동일한 구조
- 문법/개념 문제 전용

---

### 5. 오답 노트 모델 (v2.0 신규)

#### WrongAnswer
학생의 오답 기록

**주요 필드**
- `studentId`: 학생 ID
- `questionId`: 문제 ID
- `wrongAnswer`: 학생이 제출한 틀린 답변
- `correctAnswer`: 정답
- `explanation`: 해설
- `isReviewed`: 복습 완료 여부
- `createdAt`: 오답 저장 일시

**특징**
- 학생이 문제를 틀리면 자동 저장
- 복습 완료 후 `isReviewed`를 true로 변경
- 카테고리별 오답 통계에 활용

**인덱스**
- studentId
- questionId
- [studentId, isReviewed] (복합 인덱스 - 미복습 오답 조회)

---

## 인덱스 전략

### 1. 단일 인덱스
- `students.studentId`: 학번으로 빠른 검색
- `teachers.teacherId`: 교사 ID로 빠른 검색
- `results.studentId`: 학생별 성적 조회
- `results.passageId`: 지문별 성적 조회
- `question_answers.resultId`: 성적별 답변 조회
- `question_answers.questionId`: 문제별 답변 조회
- `wrong_answers.studentId`: 학생별 오답 조회
- `wrong_answers.questionId`: 문제별 오답 조회

### 2. 복합 인덱스
- `assigned_passages[targetGrade, targetClass]`: 학년/반별 지정 지문 조회
- `assigned_questions[targetGrade, targetClass]`: 학년/반별 지정 문제 조회
- `wrong_answers[studentId, isReviewed]`: 학생별 미복습 오답 조회

### 3. 인덱스 선정 이유
- **자주 조회되는 필드**: studentId, passageId, questionId
- **조인 최적화**: 외래 키에 인덱스 추가
- **필터링 최적화**: targetGrade, targetClass, isReviewed
- **성능 향상**: N+1 문제 방지, 빠른 검색 응답

---

## 데이터 무결성

### Cascade 삭제
- User 삭제 시 → Teacher, Student, Account, Session 자동 삭제
- Student 삭제 시 → Result, AssignedPassage, AssignedQuestion, WrongAnswer 자동 삭제
- Passage 삭제 시 → Question, Result, AssignedPassage 자동 삭제
- Question 삭제 시 → QuestionAnswer, AssignedQuestion, WrongAnswer 자동 삭제
- Result 삭제 시 → QuestionAnswer 자동 삭제

### Unique 제약
- `User.email`: 이메일 중복 방지
- `Teacher.teacherId`: 교사 ID 중복 방지
- `Student.studentId`: 학번 중복 방지
- `Session.sessionToken`: 세션 토큰 중복 방지

---

## 마이그레이션 전략

### 개발 환경
```bash
# 스키마 변경 후 즉시 반영
npx prisma db push
```

### 프로덕션 환경
```bash
# 마이그레이션 파일 생성
npx prisma migrate dev --name description

# 프로덕션 마이그레이션 실행
npx prisma migrate deploy
```

---

## 백업 및 복구

### Neon PostgreSQL 백업
- Neon 대시보드에서 자동 백업 설정
- 수동 백업: Neon CLI 또는 pg_dump 사용

### 데이터 내보내기
```bash
# Prisma Studio 사용
npx prisma studio

# pg_dump 사용
pg_dump $DATABASE_URL > backup.sql
```

---

## 성능 최적화 팁

### 1. 쿼리 최적화
- Prisma의 `include`와 `select` 활용
- N+1 문제 해결을 위한 관계 사전 로딩
```typescript
// 좋은 예: include로 관계 사전 로딩
const result = await prisma.result.findMany({
  include: {
    student: true,
    passage: true,
    questionAnswers: {
      include: { question: true }
    }
  }
});

// 나쁜 예: 각각 조회 (N+1 문제 발생)
const results = await prisma.result.findMany();
for (const result of results) {
  const student = await prisma.student.findUnique({ where: { id: result.studentId } });
  // ...
}
```

### 2. 페이지네이션
```typescript
const results = await prisma.result.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { submittedAt: 'desc' }
});
```

### 3. 집계 쿼리
```typescript
// 학생별 평균 점수
const avgScore = await prisma.result.aggregate({
  where: { studentId: 'xxx' },
  _avg: { score: true }
});
```

---

**작성일**: 2025-10-24  
**버전**: 2.0.0  
**프로젝트**: 국어 학습 통합 시스템
