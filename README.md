# MIDAS Plugin V5 - BESTO Design

MIDAS 플러그인으로 구현된 BESTO 합성보 설계 도구입니다.  
기존 V4 버전을 리팩토링하여 유지보수성과 확장성을 개선한 V5 버전입니다.

---

## 📋 프로젝트 개요

### 목적
- **코드 구조 개선**: Monolithic 구조의 `App.tsx`를 컴포넌트 기반 아키텍처로 개선
- **Maintainability**: 유지보수가 용이하도록 로직과 UI 분리
- **Testing**: 프론트엔드 테스트 환경 구축 및 단위 테스트 추가
- 기존 기능(Python 기반 구조 계산 등)은 유지하면서 코드 품질 향상

### 기술 스택
| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript |
| UI 라이브러리 | @midasit-dev/moaui |
| 상태 관리 | Recoil |
| 계산 엔진 | Pyscript (Pyodide 기반) |
| 스타일링 | Tailwind CSS |
| 테스팅 | Jest + React Testing Library |

---

## 📁 프로젝트 구조

```
Midas Plugin V5/
├── public/
│   ├── py_main.py          # Pyscript 엔트리 포인트
│   ├── py_library.py       # 구조 계산 라이브러리
│   ├── py_base.py          # MIDAS API 기본 함수
│   └── index.html          # HTML 템플릿
│
├── src/
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── SectionList.tsx # 섹션 리스트 컴포넌트
│   │   ├── DetailDialog.tsx# 상세 정보 다이얼로그
│   │   ├── SearchForm.tsx  # 검색 폼 컴포넌트
│   │   └── DesignDialog.tsx# 디자인 설정 다이얼로그
│   │
│   ├── utils/              # 유틸리티 함수
│   │   ├── utils_pyscript.ts # Python 연동
│   │   └── utils_typescript.ts # 일반 유틸리티
│   │
│   ├── types/              # TypeScript 타입 정의
│   ├── data/               # 정적 데이터
│   ├── App.tsx             # 메인 앱 컨테이너
│   └── index.tsx           # 진입점
│
├── test/                   # 테스트 관련 파일
├── package.json
└── README.md
```

---

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm start
```

**PowerShell에서 실행:**
```powershell
cd "C:\Besto Designer\Midas Plugin V5"; npm start
```

### 3. 브라우저에서 확인
```
http://localhost:3000
```

---

## 📊 V5 주요 변경 사항

### 1. 컴포넌트 구조화
- 기존의 비대했던 `App.tsx`에서 주요 UI 요소를 독립적인 컴포넌트로 분리했습니다.
- **SectionList**: 검색된 부재 리스트 표시 및 단면적 출력 기능
- **DetailDialog**: 상세 정보 팝업 및 레이아웃 최적화
- **SearchForm**: 검색 입력 필드 및 상태 관리 로직 분리
- **DesignDialog**: 부재 설계 입력창 분리 및 정밀 레이아웃 적용

### 2. 코드 품질 및 기능 개선
- **타입 정의 분리**: `src/types` 디렉토리로 인터페이스 및 타입 정의 이동
- **유틸리티 분리**: `src/utils` 디렉터리로 공통 로직 이동
- **시각적 강조**: 계산 결과 "NG" 발생 시 빨간색으로 강조 표시
- **테스트 코드 도입**: `SectionList.test.tsx` 등 주요 컴포넌트에 대한 단위 테스트 추가

### 3. 성능 최적화 (2026-01-16)
- **로딩 속도 개선**: 초기 로딩 시간을 약 **15초에서 9.95초로 단축** (약 33% 개선)
- **Numpy 제거**: 사용하지 않는 대용량 패키지(`numpy`)를 제거하여 네트워크 병목 및 엔진 초기화 오버헤드 해소
- **스크립트 통합**: 5개로 나뉘어 있던 `py-script` 태그를 단일 태그로 통합하여 브라우저 CPU 연산 최적화
- **Prefetch 적용**: `py_config.json`의 `fetch` 설정을 통해 파이썬 리소스를 병렬로 미리 로드

> [!TIP]
> 상세한 최적화 과정과 데이터 측정 결과는 [성능 최적화 보고서](docs/performance_optimization.md)에서 확인하실 수 있습니다.


---

## ⚠️ 참고 사항 (Notes)

### 콘솔 경고 메시지 (React DOM Attribute Warning)
플러그인 실행 시 콘솔에 `row`, `verCenter` 관련 경고 메시지가 나타날 수 있습니다.
- **원인**: `moaui` 라이브러리 내부 속성이 DOM으로 누수되는 현상입니다.
- **상태**: 기능상 지장이 없으므로 무시하셔도 무방합니다.

### 접근성 경고 (ARIA-hidden & Focus) - 완전 해결
- **현상**: 다이얼로그 오픈/종료 시 "Blocked aria-hidden on an element because its descendant retained focus" 경고 발생.
- **원인**: 배경이 숨겨지는 시점과 포커스 이동 시점의 불일치로 인한 타이밍 이슈.
- **최종 해결책**:
  - **오픈/종료 트리거 제어**: `Detail`, `Design` 버튼 클릭 시 즉시 `blur()`를 호출하여 배경 숨김 전 포커스 충돌을 원천 차단.
  - **렌더링 전략 최적화**: `DetailDialog`를 항상 마운트 상태로 유지하여 라이브러리의 내부 포커스 히스토리 관리 안정화.
  - **포커스 강제 이동**: 다이얼로그 전용 버튼에 `autoFocus`를 적용해 팝업 내부로 즉시 포커스 유도.

---

## 📝 히스토리

### 2026-01-16: 콘솔 경고 완전 해결 및 로딩 최적화
- **Accessibility Fix**: 
  - 다이얼로그 오픈/종료 시 `blur()` 처리로 `aria-hidden` 콘솔 경고 **완전 해결**
  - `DetailDialog` 렌더링 전략 수정(Always Mount)을 통한 포커스 안정화
- **Performance Optimization**: Numpy 제거 및 스크립트 통합으로 로딩 시간 **33% 단축** (15s → 9.95s)
- **Known Issues**: 라이브러리(`moaui`) 기인 레이아웃 속성 경고 원인 파악 및 문서화

### 2026-01-15: UI 개선 및 기능 고도화
- **Component Refactoring**: `SearchForm`, `DesignDialog` 컴포넌트 추가 추출
- **Feature Add**: `SectionList`에 단면적(Area) 표시 컬럼 추가
- **UI Enhancement**: "NG" 텍스트 색상 강조 및 다이얼로그 레이아웃(너비 고정 등) 최적화

### 2026-01-14: V5 리팩토링 진행
- **Project Setup**: V4 기반으로 V5 프로젝트 생성
- **Refactoring**: 
  - 컴포넌트 추출 (SectionList, DetailDialog)
  - 폴더 구조 재편 (components, utils, types)
- **Testing**: Jest 테스트 환경 설정 및 초기 테스트 작성

### 2026-01-06: V4 프로젝트 초기 설정 (Legacy)
- 기존 Excel/Python 로직을 웹 플러그인으로 이전
- MIDAS/moaui 기반 UI 구축

---

## 📄 라이선스

MIDAS IT Co., Ltd. Internal Use Only
