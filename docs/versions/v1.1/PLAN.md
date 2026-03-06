# v1.1 업데이트 계획

## 개요
v1.0에서 추가된 통계 세분화, 지문-시험지 연동, 재응시 기능을 기반으로
사용성 개선 및 추가 요청 기능을 구현한다.

## 변경 사항

### 1. 자유 재응시 (배정 시 최대 응시 횟수 설정) ✅
- **현재**: 교사가 응시 현황에서 개별 학생에게 "재응시허용" 버튼을 눌러야 함
- **변경**: 시험지 배정 시 "최대 응시 횟수" 옵션 추가 (1회~무제한)
- **구현 내역**:
  - `src/app/teacher/exams/[id]/assign/page.tsx` - maxAttempts 상태 + 드롭다운 UI 추가
  - `src/app/api/teacher/exams/[id]/assign/route.ts` - POST에서 maxAttempts 받아 allowRetake/maxAttempts 저장

### 2. 비문학 파트별 세분화 통계 (개인별) ✅
- **현재**: 개인별 통계가 카테고리(비문학/문학/문법) 대분류로만 구분됨
- **변경**: Exam에 `subcategory` 필드 추가, 시험지 생성/수정 시 선택, 개인별 통계에 반영
- **구현 내역**:
  - `prisma/schema.prisma` - Exam 모델에 subcategory 추가
  - `src/app/teacher/exams/new/page.tsx` - SUBCATEGORIES 맵 + 세부 영역 라디오 버튼
  - `src/app/teacher/exams/[id]/edit/page.tsx` - SUBCATEGORIES 맵 + 세부 영역 라디오 버튼
  - `src/app/api/teacher/exams/route.ts` - POST에서 subcategory 저장
  - `src/app/api/teacher/exams/[id]/route.ts` - PUT에서 subcategory 저장
  - `src/app/api/teacher/statistics/student/route.ts` - subcategoryAvg 계산 + 응답에 포함
  - `src/app/teacher/stats/page.tsx` - 개인별 통계 탭에 세부 영역별 평균 바 차트 추가

### 3. 학년 일괄 진급 ✅
- **현재**: 학년 변경은 학생 개별 수정으로만 가능
- **변경**: 교사 학생관리에 "일괄 진급" 버튼 추가, 전체 학생 grade+1, 3학년은 졸업(비활성화)
- **구현 내역**:
  - `src/app/api/teacher/students/promote/route.ts` - POST: 3학년→비활성화, 2학년→3학년, 1학년→2학년
  - `src/app/teacher/students/PromoteButton.tsx` - 클라이언트 컴포넌트 (확인 대화상자 + 결과 알림)
  - `src/app/teacher/students/page.tsx` - PromoteButton 임포트 + 헤더에 배치

### 4. 학생 상세 페이지에서 시험지 배정 ✅
- **현재**: 시험지 메뉴 → 배정 페이지에서만 배정 가능
- **변경**: 학생 상세 페이지에 "시험지 배정" 버튼 + 시험지 선택 모달 추가
- **구현 내역**:
  - `src/app/teacher/students/[id]/page.tsx` - 시험지 배정 모달 (시험지 선택 + 마감일 + 최대 응시 횟수)

## DB 스키마 변경
```prisma
// Exam 모델에 추가
model Exam {
  subcategory String? // 세부 카테고리 (인문예술, 과학기술, 사회문화, 고전산문, 고전시가, 현대산문, 현대시)
}
```

## 세부 카테고리 맵
- 비문학: 인문예술, 과학기술, 사회문화
- 문학: 고전산문, 고전시가, 현대산문, 현대시

## 마이그레이션
- `npx prisma migrate dev --name v1.1-exam-subcategory`
- DATABASE_URL 환경변수 필요
