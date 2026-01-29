# MIDAS Plugin Cloud V0.1 — 개발 일지

이 문서는 [CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md](./CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md)에 따른 개발 진행 내용을 기록한 일지입니다.

---

## 참조

| 항목 | 문서 |
|------|------|
| 구현 계획 | [CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md](./CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md) |
| 상위 계획 | [CLOUD_MIGRATION_PLAN.md](./CLOUD_MIGRATION_PLAN.md) |
| 스킬 추천 | [CLOUD_MIGRATION_SKILLS.md](./CLOUD_MIGRATION_SKILLS.md) |

---

## 2025-01-29 (Phase 1 일부 완료)

### 진행 방식

- **executing-plans** 스킬 적용: 계획 로드 후 첫 배치(1.1, 1.2, 1.3) 순차 실행.
- **verification-before-completion** 적용: 각 작업 완료 시 계획서의 검증 명령 실행 후 결과로 완료 여부 판단.

---

### 1.1 백엔드 프로젝트 뼈대 생성 ✅

**목표:** `backend/` 및 FastAPI 프로젝트 생성.

**작업 내용**

| # | 내용 | 산출물 |
|---|------|--------|
| 1 | 프로젝트 루트에 `backend/` 생성 | `backend/` |
| 2 | FastAPI 앱 인스턴스 및 `GET /` 루트 응답 구현 | `backend/app/main.py` |
| 3 | 의존성 목록 작성 | `backend/requirements.txt` (fastapi, uvicorn, python-multipart) |
| 4 | 앱 패키지 인식용 `backend/app/__init__.py` 추가 | `backend/app/__init__.py` |

**검증**

- `Invoke-WebRequest http://localhost:8000/` → **HTTP 200** 확인.

**비고**

- 루트 응답: `{"message": "BESTO Design Cloud API"}`.

---

### 1.2 계산 라이브러리 이전 및 백엔드 전용 정리 ✅

**목표:** `py_library`, `py_config`, `py_main`을 `backend/library/`로 이전하고, 백엔드 전용으로 의존성 정리.

**작업 내용**

| # | 내용 | 산출물 |
|---|------|--------|
| 1 | `backend/library/` 디렉터리 생성 | `backend/library/` |
| 2 | `public/py_library.py` → `backend/library/py_library.py` 복사 (무변경) | `backend/library/py_library.py` |
| 3 | `public/py_config.py` → `backend/library/py_config.py` 복사 (무변경) | `backend/library/py_config.py` |
| 4 | `public/py_main.py` 기반 **백엔드 전용** `py_main.py` 작성 | `backend/library/py_main.py` |
| 5 | 패키지 인식용 `__init__.py` 추가 | `backend/library/__init__.py` |

**백엔드 전용 `py_main.py` 변경 사항**

- 제거: `js`, `py_base`, `py_base_sub` import 및 해당 사용처.
- 유지: `get_beam_info`, `get_neighbor_h_beams`, `calculate_design_strength`, `_run_design_calculation` 및 내부 로직.
- `main()`: Pyscript 엔트리 불필요 → **no-op** (`pass`) 처리.
- import: `library.py_library`, `library.py_config` 사용 (backend 루트 기준 패키지).

**검증**

- `cd backend` 후  
  `python -c "from library.py_main import calculate_design_strength, get_beam_info, get_neighbor_h_beams; print('OK')"`  
  → **OK** 출력, import 성공.

**비고**

- `py_base.py`, `py_base_sub.py`, `py_config.json`은 백엔드로 이전하지 않음 (Phase 2에서 Pyscript 제거 시 정리 예정).

---

### 1.3 API 엔드포인트 구현 ✅

**목표:** `/api/calculate`, `/api/beam-info`, `/api/beam-neighbors`, `/api/health` 구현.

**작업 내용**

| # | 내용 | 산출물 |
|---|------|--------|
| 1 | `backend/app/api/` 생성 및 라우트·스키마 모듈 추가 | `backend/app/api/__init__.py`, `routes.py`, `schemas.py` |
| 2 | **POST /api/calculate** 구현 | `routes.py` |
| 3 | **GET /api/beam-info**, **GET /api/beam-neighbors**, **GET /api/health** 구현 | `routes.py` |
| 4 | `app/main.py`에 API 라우터 등록 (`prefix="/api"`) | `backend/app/main.py` |

**엔드포인트 요약**

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | `{"status": "ok"}` 반환. |
| GET | `/api/beam-info?section_name=` | H형강 정보 조회. 없으면 404. |
| GET | `/api/beam-neighbors?selected_member=` | 선택 부재 기준 이웃 H형강 목록(배열). Search 플로우용. |
| POST | `/api/calculate` | Body = pythonInput 동일 JSON. `get_default_design_inputs()`로 보완 후 `calculate_design_strength` 호출. 응답 = DetailResult 형태. 에러 시 422/500. |

**검증**

- FastAPI **TestClient**로 검증 (실서버는 포트 8000 선점으로 기동 생략).
  - `GET /api/health` → 200, `{"status": "ok"}`.
  - `GET /api/beam-info?section_name=H-600X200X11X17` → 200, H형강 필드(H, B, t1, t2 등) 포함.
  - `GET /api/beam-neighbors?selected_member=H-600X200X11X17` → 200, 길이 5 배열.
  - `POST /api/calculate` body `{"selectedMember": "H-600X200X11X17"}` → 200, `sectionInfo` 등 DetailResult 형태.

**비고**

- `schemas.py`에 `CalculateRequest`(Pydantic, `extra="allow"`), `HealthResponse` 정의. 상세 검증은 추후 확장 예정.
- 실제 curl 검증은 포트 8000 사용 중인 프로세스 종료 후  
  `cd backend ; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` 로 서버 기동하여 수행 가능.

---

### 1.4 입력/출력 스키마, 에러 처리, CORS ✅

**목표:** 요청/응답 검증, 일관된 에러 응답, CORS 설정.

**작업 내용**

| # | 내용 | 산출물 |
|---|------|--------|
| 1 | CORS: `CORSMiddleware` 추가, `allow_origins=["http://localhost:3000"]`, `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]` | `backend/app/main.py` |
| 2 | 500 시 서버 로그: `POST /api/calculate` 내부 예외 시 `logger.exception(...)` 호출 후 일반 안내 메시지 반환 | `backend/app/api/routes.py` |
| 3 | 422: `section_name`/`selected_member` 누락 시 FastAPI `Query(...)` 자동 422 반환 유지 | (기존 동작) |

**검증**

- TestClient로 `GET /api/beam-info` (query 없음) → **422**, `detail`: `[{"type":"missing","loc":["query","section_name"],"msg":"Field required"}]`.
- CORS: `main.py`에 `CORSMiddleware` 적용 완료. 브라우저에서의 CORS 검증은 Phase 2 프론트 연동 시 확인.

**비고**

- `schemas.py`의 `CalculateRequest`·`HealthResponse`는 1.3에서 이미 정의됨. 엄격한 검증은 추후 확장 예정.

---

### Phase 1 체크리스트 (현재까지)

- [x] 1.1 `backend/` 구조 생성, `uvicorn` 실행 및 루트 응답 확인
- [x] 1.2 `backend/library/`에 `py_library`, `py_config`, `py_main` 이전 및 import 확인
- [x] 1.3 `/api/calculate`, `/api/beam-info`, `/api/beam-neighbors`, `/api/health` 구현 및 검증
- [x] 1.4 스키마·에러 처리·CORS 적용 및 검증

---

### 다음 작업 (예정)

1. **Phase 3**  
   - 3.1 백엔드 pytest → 3.2 프론트·백엔드 연동 회귀 테스트 → 3.3 API 문서·README 정리.

---

## 2025-01-29 (Phase 2.1 완료)

### 2.1 API 클라이언트 구현 ✅

**목표:** `src/api/client.ts`, `endpoints.ts` 추가, 공통 HTTP 클라이언트 및 API 함수 구현.

**작업 내용**

| # | 내용 | 산출물 |
|---|------|--------|
| 1 | `src/api/` 디렉터리 생성 | `src/api/` |
| 2 | `client.ts`: baseURL = `REACT_APP_API_URL \|\| "http://localhost:8000"`, fetch 래퍼, 타임아웃 30초, `Content-Type: application/json`, 에러 시 status/detail 전달 | `src/api/client.ts` |
| 3 | `endpoints.ts`: `getHealth()`, `getBeamInfo(sectionName)`, `getBeamNeighbors(selectedMember)`, `postCalculate(body)` 구현. `DetailResult`·타입은 `types/index` 사용 | `src/api/endpoints.ts` |

**검증**

- 린트 에러 없음. 실제 `getHealth`/`postCalculate` 동작은 Phase 2.2에서 App 전환 후 백엔드 연동 시 통합 검증.

---

## 2025-01-29 (Phase 2.2~2.4 완료)

### 2.2 App.tsx 계산 경로 API 전환 ✅

**작업:** Pyscript `get_neighbor_h_beams`·`calculate_design_strength` 제거, `getBeamNeighbors`·`postCalculate` 사용. Search/Design 플로우에서 `pythonInput` 구성 유지, try/catch 시 "연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요." 등 사용자 메시지 노출.

**산출물:** 수정된 `src/App.tsx` (utils_pyscript 제거, api/endpoints 사용).

---

### 2.3 Pyscript 제거 및 로딩·설정 정리 ✅

**작업:**  
① `public/index.html`: Pyscript 스크립트·`py-config`·`<py-script>` 블록 제거.  
② 로딩: React 마운트 후 `GET /api/health` 성공/실패 시 `hideLoadingScreen` 호출 (Wrapper `ApiWrapper`에서 처리).  
③ `public/py_config.json` 삭제.  
④ `global.d.ts`에 `Window.hideLoadingScreen`, `updateLoadingStatus` 타입 추가.  
⑤ **Wrapper**: `ValidWrapper`에 `isApiReady` 전달, Validation "pyscript" → "API" (strInvalid="Not connected"). 기본 export를 `ApiWrapper`로 변경 — mount 시 `getHealth()` 호출 후 성공 시 `hideLoadingScreen()`·`setApiReady(true)`, 실패 시 `hideLoadingScreen()`·`setApiReady(false)`.

**산출물:** 수정된 `index.html`, `Wrapper.tsx`, `global.d.ts`, 삭제된 `py_config.json`.

---

### 2.4 패키지·의존성 정리 ✅

**작업:**  
① `package.json`: Pyscript 관련 패키지 없음 (index.html 스크립트만 제거로 충분).  
② HTTP 클라이언트: fetch 사용, 추가 패키지 없음.  
③ `.env.development` 추가: `REACT_APP_API_URL=http://localhost:8000`.

**산출물:** `.env.development`.

**검증:** 린트 통과. 로컬에서 `npm install` 후 `npm run build` 또는 `npm start`로 기동·API 연동 확인. (빌드 검증은 환경에 따라 `node_modules`/캐시 필요.)

---

### Phase 2 체크리스트 (완료)

- [x] 2.1 API 클라이언트·엔드포인트 구현
- [x] 2.2 App.tsx Search/Design 플로우 API 호출로 전환
- [x] 2.3 index.html Pyscript 제거, 로딩·py_config.json 정리, Wrapper API 검사
- [x] 2.4 패키지·환경 변수 정리

---

### 산출물 디렉터리 구조 (현재)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 앱, CORS, /api 라우터 등록
│   └── api/
│       ├── __init__.py
│       ├── routes.py    # /health, /beam-info, /beam-neighbors, /calculate
│       └── schemas.py   # CalculateRequest, HealthResponse
├── library/
│   ├── __init__.py
│   ├── py_library.py
│   ├── py_config.py
│   └── py_main.py
└── requirements.txt

src/
├── api/
│   ├── client.ts        # baseURL, fetch 래퍼, 타임아웃 30초
│   └── endpoints.ts     # getHealth, getBeamInfo, getBeamNeighbors, postCalculate
├── App.tsx
├── types/
│   └── index.ts
└── ...
```

---

*이 일지는 CLOUD_MIGRATION_IMPLEMENTATION_PLAN 기준 Phase 1(1.1~1.4) 및 Phase 2(2.1~2.4) 완료 시점까지를 반영합니다.*
