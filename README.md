# 게시판 서비스 프론트엔드

Next.js, TypeScript, Tailwind CSS를 사용한 게시판 서비스 프론트엔드입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 기능

- ✅ 회원가입 및 로그인
- ✅ 게시글 목록 조회 (페이지네이션)
- ✅ 게시글 작성
- ✅ 게시글 수정
- ✅ 게시글 삭제
- ✅ 게시글 상세 조회
- ✅ 반응형 디자인
- ✅ 로딩 애니메이션
- ✅ 에러 처리

## 프로젝트 구조

```
frontend/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 메인 페이지
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   └── posts/             # 게시글 관련 페이지
├── components/            # React 컴포넌트
│   ├── Header.tsx         # 헤더 컴포넌트
│   ├── PostList.tsx       # 게시글 목록
│   ├── PostCard.tsx       # 게시글 카드
│   ├── PostForm.tsx       # 게시글 작성/수정 폼
│   └── ui/                # Shadcn/ui 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── api.ts             # API 클라이언트
│   ├── types.ts           # TypeScript 타입 정의
│   ├── store.ts           # Redux store
│   ├── slices/            # Redux slices
│   └── hooks.ts           # Redux hooks
└── public/                # 정적 파일
```

## API 연동

백엔드 API는 `http://localhost:8080`을 기본값으로 사용합니다.
환경 변수 `NEXT_PUBLIC_API_URL`로 변경할 수 있습니다.

### API 엔드포인트

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/post` - 게시글 목록 조회
- `GET /api/post/{id}` - 게시글 상세 조회
- `POST /api/post` - 게시글 작성
- `PATCH /api/post/{id}` - 게시글 수정
- `DELETE /api/post/{id}` - 게시글 삭제

## 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```# 2215-ParkChangYeon
okujhygtfrdsxzcva