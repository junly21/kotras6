# Kotras6 Project

Next.js 기반의 대시보드 애플리케이션입니다.

## 주요 기능

- **2-depth 사이드바 메뉴**: Zustand를 사용한 상태 관리
- **API 통합**: 외부 API와의 통신을 위한 프록시 구조
- **AG Grid**: 데이터 그리드 표시
- **반응형 레이아웃**: Tailwind CSS를 사용한 모던한 UI

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Grid**: AG Grid
- **API**: Fetch API with Proxy

## 프로젝트 구조

```
app/
├── api/           # Next.js API Routes
├── components/    # 재사용 가능한 컴포넌트
├── hooks/         # 커스텀 훅
├── services/      # API 서비스 레이어
├── store/         # Zustand 스토어
└── test-grid/     # 테스트 페이지
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 환경 설정

- Node.js 18+ 필요
- 포트 3000에서 실행 (기본값)

## API 구조

- **프록시 API**: `/api/proxy` - CORS 문제 해결을 위한 프록시
- **외부 API**: `http://192.168.111.152:8080/kotras6/` - 실제 데이터 소스

## 라이센스

MIT License
