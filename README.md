# MIDAS Plugin Cloud V0.1 — BESTO Design

BESTO 합성보 설계 도구의 **Cloud 버전**입니다.  
계산 엔진을 브라우저(Pyscript)에서 **백엔드 REST API(FastAPI)** 로 이전하여, 프론트엔드(React)는 API 호출로 설계강도 계산을 수행합니다.

---

## 📋 프로젝트 개요

### 목적
- **계산 이전**: Pyscript(Pyodide) 대신 백엔드 FastAPI 서버에서 구조 계산 수행
- **프론트·백엔드 분리**: React ↔ REST API ↔ FastAPI 구조
- **로컬/배포**: 백엔드(uvicorn)와 프론트(npm start)를 각각 실행하여 연동

### 현재 상태
- **Phase 1~3 완료**: 백엔드 구축, 프론트 API 전환, Pyscript 제거, 통합 테스트·문서 정리까지 반영된 상태입니다.
- 상세 진행 내역은 [CLOUD_MIGRATION_DEVLOG.md](./CLOUD_MIGRATION_DEVLOG.md), 단계별 계획은 [CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md](./CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md)를 참조하세요.

### 기술 스택
| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript |
| API 클라이언트 | fetch, `src/api/` (client.ts, endpoints.ts) |
| UI 라이브러리 | @midasit-dev/moaui |
| 상태 관리 | Recoil |
| 백엔드 | FastAPI, uvicorn |
| 계산 엔진 | Python (backend/library: py_library, py_config, py_main) |
| 스타일링 | Tailwind CSS |

---

## 📁 프로젝트 구조

```
Midas Plugin Cloud V0.1/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py             # FastAPI 앱, CORS, /api 라우터
│   │   └── api/
│   │       ├── routes.py       # /health, /beam-info, /beam-neighbors, /calculate
│   │       └── schemas.py      # 요청/응답 스키마
│   ├── library/                # 구조 계산 라이브러리 (이전됨)
│   │   ├── py_library.py
│   │   ├── py_config.py
│   │   └── py_main.py
│   ├── tests/                  # API 단위·통합 테스트 (pytest)
│   │   ├── conftest.py
│   │   └── test_api.py
│   ├── pytest.ini
│   └── requirements.txt
│
├── public/
│   ├── index.html              # Pyscript 제거, 로딩 화면 유지
│   └── ...
│
├── src/
│   ├── api/                    # API 클라이언트
│   │   ├── client.ts           # baseURL, fetch, 타임아웃 30초
│   │   └── endpoints.ts        # getHealth, getBeamInfo, getBeamNeighbors, postCalculate
│   ├── components/
│   │   ├── SectionList.tsx
│   │   ├── DetailDialog.tsx
│   │   ├── SearchForm.tsx
│   │   └── DesignDialog.tsx
│   ├── types/
│   ├── App.tsx                 # Search/Design 플로우 → API 호출
│   ├── Wrapper.tsx             # GET /api/health 성공 시 로딩 숨김, API 검증
│   └── index.tsx
│
├── docs/
│   └── REGRESSION_TEST_CHECKLIST.md  # 프론트·백 연동 회귀 테스트 체크리스트
├── .env.development            # REACT_APP_API_URL=http://localhost:8000
├── package.json
├── CLOUD_MIGRATION_PLAN.md     # 마이그레이션 상위 계획
├── CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md  # 단계별 개발 계획
├── CLOUD_MIGRATION_DEVLOG.md   # 개발 일지
└── README.md
```

---

## 🚀 로컬 실행 방법

### 1. 백엔드 실행 (터미널 1)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**PowerShell:**
```powershell
cd "c:\Besto Designer\Midas Plugin Cloud V0.1\backend"
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API 문서: http://localhost:8000/docs (Swagger), http://localhost:8000/redoc (ReDoc)  
- Health: http://localhost:8000/api/health  

**백엔드 단독 테스트 (pytest):**
```bash
cd backend
pip install -r requirements.txt
pytest
```

### 2. 프론트엔드 실행 (터미널 2)

```bash
npm install
npm start
```

**PowerShell:**
```powershell
cd "c:\Besto Designer\Midas Plugin Cloud V0.1"
npm install
npm start
```

- 앱: http://localhost:3000  
- 백엔드가 떠 있으면 로딩 화면 후 앱 표시, Validation에서 "API: Valid"  
- 백엔드가 꺼져 있으면 "API: Not connected" Validation 화면 표시  

### 3. 환경 변수 (선택)

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `REACT_APP_API_URL` | 프론트에서 호출하는 API base URL | `http://localhost:8000` |

`.env.development`에 이미 `REACT_APP_API_URL=http://localhost:8000`이 있으면 별도 설정 없이 사용 가능합니다.

---

## 📡 API 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/beam-info?section_name=` | H형강 정보 조회 |
| GET | `/api/beam-neighbors?selected_member=` | 선택 부재 기준 이웃 H형강 목록 (Search용) |
| POST | `/api/calculate` | 설계강도 계산. Body = pythonInput 동일 JSON. 응답 = DetailResult 형태 |

상세 스키마는 http://localhost:8000/docs 에서 확인할 수 있습니다.

---

## 🧪 테스트 및 회귀 검증

- **백엔드 API 테스트**: `cd backend && pytest` — `/api/health`, `/api/beam-info`, `/api/beam-neighbors`, `/api/calculate` 정상·엣지 케이스 검증.
- **프론트·백 연동 회귀**: 백엔드(8000)와 프론트(3000) 동시 실행 후 [docs/REGRESSION_TEST_CHECKLIST.md](./docs/REGRESSION_TEST_CHECKLIST.md) 체크리스트대로 Search → Design → 에러 시나리오 수행.

---

## 📊 Cloud V0.1 주요 변경 사항

### Phase 1 (백엔드)
- FastAPI 프로젝트 뼈대, CORS, 스키마·에러 처리
- `backend/library/`에 py_library, py_config, py_main 이전 (백엔드 전용)
- `/api/calculate`, `/api/beam-info`, `/api/beam-neighbors`, `/api/health` 구현

### Phase 2 (프론트엔드)
- `src/api/` 클라이언트·엔드포인트 추가 (getHealth, getBeamInfo, getBeamNeighbors, postCalculate)
- App.tsx Search/Design 플로우를 Pyscript 대신 API 호출로 전환
- index.html에서 Pyscript·py-config·py-script 제거, `py_config.json` 삭제
- 로딩: React 마운트 후 GET /api/health 성공 시 로딩 화면 숨김
- Wrapper: "pyscript" 검사 → "API" 검사 (isApiReady = GET /api/health 200 여부)
- `.env.development`에 REACT_APP_API_URL 추가

### Phase 3 (테스트·문서)
- 백엔드 pytest 추가 (`backend/tests/`, `pytest.ini`), `cd backend && pytest` 통과
- 프론트·백 연동 회귀 테스트 체크리스트: [docs/REGRESSION_TEST_CHECKLIST.md](./docs/REGRESSION_TEST_CHECKLIST.md)
- API 문서: FastAPI 기본 `/docs`, `/redoc` 활용, README에 Quick Start·테스트 안내 정리

### 비목표 (현재 버전)
- API 인증/멀티테넌트
- 배치 계산 (`/api/calculate/batch`)
- MIDAS API·MAPI-Key 사용

---

## ⚠️ 참고 사항

### 콘솔 경고 (moaui)
`row`, `verCenter` 등 moaui 레이아웃 속성 관련 경고가 나올 수 있습니다. 기능상 무시해도 됩니다.

### utils_pyscript
SampleComponents·DevTools 등에서 `utils_pyscript`를 사용하는 부분은 Cloud V0.1에서 **BESTO 계산 경로**만 API로 전환한 상태입니다. 해당 기능은 Pyscript 제거로 비활성화될 수 있으며, 필요 시 별도 정리가 필요합니다.

---

## 📝 참조 문서

- [CLOUD_MIGRATION_PLAN.md](./CLOUD_MIGRATION_PLAN.md) — 마이그레이션 상위 계획
- [CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md](./CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md) — 단계별 개발 계획 (Phase 1~3)
- [CLOUD_MIGRATION_DEVLOG.md](./CLOUD_MIGRATION_DEVLOG.md) — 개발 일지
- [CLOUD_MIGRATION_SKILLS.md](./CLOUD_MIGRATION_SKILLS.md) — 계획 수행 시 Cursor Agent 스킬 추천
- [docs/REGRESSION_TEST_CHECKLIST.md](./docs/REGRESSION_TEST_CHECKLIST.md) — 프론트·백 연동 회귀 테스트 체크리스트

---

## 📄 라이선스

MIDAS IT Co., Ltd. Internal Use Only
