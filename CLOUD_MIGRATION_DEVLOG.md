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

### Phase 1 체크리스트 (현재까지)

- [x] 1.1 `backend/` 구조 생성, `uvicorn` 실행 및 루트 응답 확인
- [x] 1.2 `backend/library/`에 `py_library`, `py_config`, `py_main` 이전 및 import 확인
- [x] 1.3 `/api/calculate`, `/api/beam-info`, `/api/beam-neighbors`, `/api/health` 구현 및 검증
- [ ] 1.4 스키마·에러 처리·CORS 적용 및 검증

---

### 다음 작업 (예정)

1. **1.4**  
   - `schemas.py` 보완(필요 시), 400/422/500 일관 처리, CORS(`allow_origins=["http://localhost:3000"]` 등) 적용.  
   - 검증: `section_name` 없이 `GET /api/beam-info` → 422/400, 프론트 origin에서 fetch 시 CORS 오류 없음 확인.

2. **Phase 2**  
   - 2.1 API 클라이언트(`src/api/`) → 2.2 App.tsx 계산 경로 API 전환 → 2.3 Pyscript 제거·로딩 정리 → 2.4 패키지·의존성 정리.

---

### 산출물 디렉터리 구조 (현재)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 앱, /api 라우터 등록
│   └── api/
│       ├── __init__.py
│       ├── routes.py    # /health, /beam-info, /beam-neighbors, /calculate
│       └── schemas.py   # CalculateRequest, HealthResponse
├── library/
│   ├── __init__.py
│   ├── py_library.py    # public과 동일
│   ├── py_config.py     # public과 동일
│   └── py_main.py       # 백엔드 전용 (js/py_base 제거, main no-op)
└── requirements.txt
```

---

*이 일지는 CLOUD_MIGRATION_IMPLEMENTATION_PLAN 기준 Phase 1의 1.1~1.3 완료 시점까지를 반영합니다.*
