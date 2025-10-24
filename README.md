# Motnt Ad Place

한국 옥외광고 정보 플랫폼

## 프로젝트 개요

옥외광고(간판, LED, 현수막 등)의 위치, 가격, 상세 정보를 지도 기반으로 제공하는 웹 플랫폼입니다.

## 주요 기능

### 사용자 기능
- **지도 기반 광고 위치 검색**: 카카오맵을 활용한 시각적 광고 위치 표시
- **광고 정보 조회**: 광고판 크기, 타입, 가격, 위치 상세 정보
- **검색 및 필터링**: 
  - 지역별 검색 (구/동 단위)
  - 가격대별 필터링
  - 광고 유형별 필터링 (LED, 현수막, 버스정류장 등)
- **반응형 웹/웹앱**: 모바일 최적화

### 관리자 기능
- **광고 데이터 관리**: 광고 위치 추가/수정/삭제
- **광고판 정보 관리**: 크기, 타입, 가격 정보 관리
- **이미지 관리**: 광고판 실제 사진 업로드
- **지도 데이터 관리**: 지도 마커 위치 설정, 지역 분류 관리
- **관리자 인증**: 로그인/로그아웃 시스템

## 기술 스택

### Frontend & Backend
- **Next.js 14** (App Router) - 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **TailwindCSS** - 스타일링

### Database & Authentication
- **Supabase** - PostgreSQL 기반 BaaS
- **Prisma** - ORM
- **Supabase Auth** - 관리자 인증

### Map & External APIs
- **Kakao Maps API** - 지도 서비스
- **react-kakao-maps-sdk** - React 카카오맵 라이브러리

### File Storage
- **Supabase Storage** - 이미지 업로드 및 관리

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 개발 진행

현재 Phase 1 진행 중 - 프로젝트 기반 설정

자세한 마일스톤은 [MILESTONES.md](./MILESTONES.md)를 참조하세요.

## 향후 확장 계획

- PWA 기능 추가
- 모바일 네이티브 앱 개발
- 다국어 지원 (영어, 일본어, 중국어)
- 예약 및 결제 시스템 도입
- 실시간 광고 가용성 업데이트