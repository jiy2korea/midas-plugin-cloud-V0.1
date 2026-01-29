# MIDAS Plugin Cloud V0.1 — 단계별 개발 계획

이 문서는 [CLOUD_MIGRATION_PLAN.md](./CLOUD_MIGRATION_PLAN.md)에 정리된 마이그레이션 계획을 바탕으로, **구체적이고 실행 가능한 단계별 개발 계획**을 기술합니다.  
각 단계는 선행 작업·산출물·검증 방법을 포함합니다.

---

## 📌 참조 문서 및 전제

| 항목 | 내용 |
|------|------|
| **상위 계획** | [CLOUD_MIGRATION_PLAN.md](./CLOUD_MIGRATION_PLAN.md) |
| **아키텍처** | 프론트(React) ↔ REST API ↔ 백엔드(FastAPI) |
| **비목표** | API 인증/멀티테넌트, 배치 계산(`/api/calculate/batch`), MIDAS API·MAPI-Key 사용 |
| **검증 원칙** | 각 Phase 완료 시 해당 단계 체크리스트와 명령으로 동작 확인 |

---

## 진행 순서 요약

```
1.1 백엔드 뼈대 → 1.2 library 이전 → 1.3 API 구현 → 1.4 스키마/CORS
       ↓
2.1 API 클라이언트 → 2.2 App.tsx 전환 → 2.3 Pyscript 제거/로딩 → 2.4 패키지 정리
       ↓
3.1 백엔드 테스트 → 3.2 연동 회귀 테스트 → 3.3 API 문서/README
```

- **Phase 1** 선행 후 **Phase 2** 진행. **Phase 3**은 1·2 완료 후 통합 검증 및 정리.

---

## Phase 1: 백엔드 서버 구축 (1~2주)

### 1.1 백엔드 프로젝트 뼈대 생성

| 항목 | 내용 |
|------|------|
| **목표** | `backend/` 디렉터리 및 FastAPI 프로젝트 생성 |
| **선행** | 없음 |
| **작업** | ① 프로젝트 루트에 `backend/` 생성<br>② `backend/app/main.py`에서 FastAPI 앱 인스턴스 생성 및 `@app.get("/")` 루트 응답 구현<br>③ `backend/requirements.txt` 작성 (fastapi, uvicorn, python-multipart 등)<br>④ `backend/` 루트에서 `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` 로 실행 가능한지 확인 |
| **산출물** | `backend/`, `backend/app/main.py`, `backend/requirements.txt` |
| **검증** | `curl http://localhost:8000/` 호출 시 200 응답 |

---

### 1.2 계산 라이브러리 이전 및 백엔드 전용 정리

| 항목 | 내용 |
|------|------|
| **목표** | `py_library.py`, `py_main.py`, `py_config.py`를 `backend/library/`로 이전하고, 백엔드 전용으로 의존성 정리 |
| **선행** | 1.1 |
| **작업** | ① `backend/library/` 디렉터리 생성<br>② `public/py_library.py` → `backend/library/py_library.py` 복사 (변경 없음)<br>③ `public/py_config.py` → `backend/library/py_config.py` 복사 (변경 없음)<br>④ `public/py_main.py`를 참고해 **백엔드 전용** `backend/library/py_main.py` 작성:<br>　・`py_base`, `py_base_sub`, `js` import **제거**<br>　・`main()` 함수 제거 또는 no-op 처리 (로딩 UI 연동 로직 불필요)<br>　・`get_beam_info`, `get_neighbor_h_beams`, `calculate_design_strength` 유지, `py_library`·`py_config`만 사용<br>⑤ `backend/library/__init__.py` 추가 (필요 시 패키지 인식용) |
| **산출물** | `backend/library/py_library.py`, `backend/library/py_config.py`, `backend/library/py_main.py` |
| **검증** | 작업 디렉터리 `backend/`에서 `python -c "from library.py_main import calculate_design_strength, get_beam_info, get_neighbor_h_beams; print('OK')"` 실행 시 import 성공 확인 |

**참고:** `py_base.py`, `py_base_sub.py`는 백엔드로 이전하지 않음. `py_config.json`은 Pyscript 전용이므로 Cloud에서 사용하지 않고, Phase 2에서 제거.

---

### 1.3 API 엔드포인트 구현

| 항목 | 내용 |
|------|------|
| **목표** | `/api/calculate`, `/api/beam-info`, `/api/beam-neighbors`, `/api/health` 구현 |
| **선행** | 1.2 |
| **작업** | ① `backend/app/api/` 생성, `routes.py`·`schemas.py` 추가<br>② **POST /api/calculate**: Request body = 기존 `pythonInput`와 동일한 JSON. `library.py_main.calculate_design_strength` 호출, 응답 = `DetailResult` 형태 JSON. 누락 필드는 `py_config.get_default_design_inputs()`로 보완 후 계산. 에러 시 `{"error": "..."}` 반환, HTTP 422 또는 500<br>③ **GET /api/beam-info**: Query `section_name` 필수. `get_beam_info(section_name)` 호출, JSON 그대로 반환. 없으면 404<br>④ **GET /api/beam-neighbors**: Query `selected_member` 필수. `get_neighbor_h_beams(selected_member)` 호출, JSON 배열 반환. Search 플로우용<br>⑤ **GET /api/health**: `{"status": "ok"}` 등 단순 JSON 반환<br>⑥ `app/main.py`에서 `app.include_router(api.routes.router, prefix="/api")` 등으로 라우트 등록 |
| **산출물** | `backend/app/api/routes.py`, `backend/app/api/schemas.py`, 라우트 연동된 `main.py` |
| **검증** | `curl -X POST http://localhost:8000/api/calculate -H "Content-Type: application/json" -d "{\"selectedMember\":\"H-600X200X11X17\"}"` → 200 + `DetailResult` 형태 JSON<br>`curl "http://localhost:8000/api/beam-info?section_name=H-600X200X11X17"` → 200 + H형강 정보<br>`curl "http://localhost:8000/api/beam-neighbors?selected_member=H-600X200X11X17"` → 200 + 배열<br>`curl http://localhost:8000/api/health` → 200 + `{"status":"ok"}` |

---

### 1.4 입력/출력 스키마, 에러 처리, CORS

| 항목 | 내용 |
|------|------|
| **목표** | 요청/응답 검증, 일관된 에러 응답, CORS 설정 |
| **선행** | 1.3 |
| **작업** | ① `schemas.py`에 `CalculateRequest`(필수 `selectedMember` 등), `CalculateResponse`(또는 `DetailResult` 호환) 정의. Pydantic 모델로 선택적 검증 (엄격한 검증은 추후 확장)<br>② 400/422: 잘못된 입력 시 메시지 반환. 500: 서버 내부 오류 시 일반 안내 메시지 + 서버 로그<br>③ CORS: `CORSMiddleware` 추가, `allow_origins=["http://localhost:3000"]` (개발용). 필요 시 `allow_origins=["*"]`로 임시 완화 후 배포 단계에서 조정<br>④ (선택) 요청 타임아웃, 로깅 미들웨어 |
| **산출물** | 스키마 보완, CORS 설정, 에러 처리 적용된 `main.py` |
| **검증** | `section_name` 없이 `GET /api/beam-info` 호출 → 422 또는 400. 프론트 origin에서 `fetch` 시 CORS 에러 없이 응답 수신 |

---

### Phase 1 체크리스트

- [x] 1.1 `backend/` 구조 생성, `uvicorn` 실행 및 루트 응답 확인
- [x] 1.2 `backend/library/`에 `py_library`, `py_config`, `py_main` 이전 및 import 확인
- [x] 1.3 `/api/calculate`, `/api/beam-info`, `/api/beam-neighbors`, `/api/health` 구현 및 curl 검증
- [x] 1.4 스키마·에러 처리·CORS 적용 및 검증

---

## Phase 2: 프론트엔드 수정 (약 1주)

### 2.1 API 클라이언트 구현

| 항목 | 내용 |
|------|------|
| **목표** | `src/api/client.ts`, `endpoints.ts` 추가, 공통 HTTP 클라이언트 및 API 함수 구현 |
| **선행** | Phase 1 완료 (백엔드 가동 가능) |
| **작업** | ① `src/api/` 디렉터리 생성<br>② `client.ts`: baseURL = `process.env.REACT_APP_API_URL || "http://localhost:8000"`, axios 또는 `fetch` 래퍼. 타임아웃(예: 30초), `Content-Type: application/json` 설정<br>③ `endpoints.ts`: `postCalculate(body)`, `getBeamInfo(sectionName)`, `getBeamNeighbors(selectedMember)`, `getHealth()` 구현. `DetailResult`·기타 타입은 `types/index` 활용<br>④ (선택) `utils_api.ts`에서 이 함수들을 re-export하여 `App.tsx`에서 `utils_api`만 import 하도록 구성 |
| **산출물** | `src/api/client.ts`, `src/api/endpoints.ts`, (선택) `src/utils/utils_api.ts` |
| **검증** | `getHealth()` 호출 시 200 응답. `postCalculate`에 단순 `{ selectedMember: "H-600X200X11X17" }` 전달 시 `DetailResult` 형태 반환 확인 (브라우저 콘솔 또는 간단한 테스트 컴포넌트). |

---

### 2.2 App.tsx 계산 경로를 API 호출로 전환

| 항목 | 내용 |
|------|------|
| **목표** | Pyscript `calculate_design_strength`·`get_neighbor_h_beams` 호출 제거, API 클라이언트로 교체 |
| **선행** | 2.1 |
| **작업** | ① **Search 플로우** (`handleSearch`): `checkPyScriptReady` + `get_neighbor_h_beams` 제거 → `getBeamNeighbors(lastSearchInputs.selectedMember)` 호출. 응답 배열로 `neighborBeamsResult` 대체<br>② **Search 플로우** 내부 루프: `checkPyScriptReady` + `calculate_design_strength` 제거 → `postCalculate(pythonInput)` 호출. `pythonInput` 구성 로직(기존 `basePythonInput` + `selectedMember` 등) 유지<br>③ **Design 플로우** (`handleDesignDone`): 동일하게 `postCalculate(pythonInput)`로 교체. `pythonInput` 구성(마지막 검색 입력 + Design 입력 + `selectedMember`) 유지<br>④ `createSectionData`·`SectionData`·`DetailResult` 처리 로직은 그대로 두고, 응답만 API 결과로 대체<br>⑤ 에러 처리: try/catch에서 네트워크 오류·4xx/5xx 시 사용자 메시지 (예: "연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.") |
| **산출물** | 수정된 `src/App.tsx` |
| **검증** | Search 실행 → 부재 목록 및 상세 결과 표시. Design 실행 → 선택 부재에 대해 재계산 후 UI 반영. 에러 시 안내 메시지 노출 |

---

### 2.3 Pyscript 제거 및 로딩·설정 정리

| 항목 | 내용 |
|------|------|
| **목표** | `index.html`에서 Pyscript·`py-config` 제거, 로딩 화면을 API 기반으로 전환, BESTO 관련 설정 정리 |
| **선행** | 2.2 |
| **작업** | ① `public/index.html`: Pyscript 스크립트 태그, `<py-config type="json" src="./py_config.json">` 제거<br>② `<py-script>...</py-script>` 블록 전체 제거<br>③ 로딩 화면: 기존 `updateLoadingStatus`·`hideLoadingScreen` 유지. Pyscript 대신 **React 마운트 후 `GET /api/health` 성공 시** `hideLoadingScreen` 호출하도록 변경. (또는 로딩 단순화: 앱 마운트 후 일정 시간 뒤 hide 등 정책에 따라 조정)<br>④ `public/py_config.json` 삭제 (Pyscript 전용, Cloud 미사용)<br>⑤ `App.tsx`에서 `utils_pyscript` import 제거, `utils_api` 또는 `api/endpoints` 사용으로 통일<br>⑥ **Wrapper 검증**: `ValidationComponent`의 "pyscript" 검사 제거 후 **"API"** 검사로 대체. `isApiReady` = `GET /api/health` 200 여부. `isIntalledPyscript` 전달처(DevTools 등)는 `isApiReady` 또는 동일 의미 플래그로 교체 |
| **산출물** | 수정된 `public/index.html`, 삭제된 `py_config.json`, `App.tsx` import 정리, `Wrapper` 검증 로직 변경 |
| **검증** | `npm start` 후 로딩 화면이 사라지고 앱이 정상 표시. 콘솔에 Pyscript 로드 오류 없음. Search/Design 동작 유지. Validation 화면에서 "API" 항목 Valid 표시 확인 (백엔드 가동 시) |

---

### 2.4 패키지·의존성 정리

| 항목 | 내용 |
|------|------|
| **목표** | Pyscript 관련 의존성 제거, HTTP 클라이언트 추가 |
| **선행** | 2.3 |
| **작업** | ① `package.json`: Pyscript 관련 패키지가 있다면 제거 (현재 `package.json`에는 명시 없음. `index.html` 스크립트만 제거로 충분)<br>② HTTP 클라이언트: axios 사용 시 `npm install axios` 후 `api/client`에서 사용. fetch만 사용할 경우 추가 패키지 없음<br>③ `REACT_APP_API_URL`: `.env` 또는 `.env.development`에 `REACT_APP_API_URL=http://localhost:8000` 추가 (선택). 없으면 기본값 `http://localhost:8000` 사용 |
| **산출물** | `package.json`, (선택) `.env.development` |
| **검증** | `npm install` 후 `npm start` 정상 기동. API 호출 시 백엔드 주소로 요청 전송 확인 (네트워크 탭). |

---

### Phase 2 체크리스트

- [x] 2.1 `src/api/` 클라이언트 및 엔드포인트 구현, `getHealth`·`postCalculate` 동작 확인
- [x] 2.2 `App.tsx` Search/Design 플로우를 API 호출로 전환, 회귀 확인
- [x] 2.3 `index.html` Pyscript 제거, 로딩 화면 정리, `py_config.json` 삭제
- [x] 2.4 `package.json`·환경 변수 정리, `.env.development` 추가, `npm start` 및 API 연동 확인

---

## Phase 3: 통합 테스트 및 정리 (약 1주)

### 3.1 백엔드 단독 테스트

| 항목 | 내용 |
|------|------|
| **목표** | API 단위·통합 테스트로 동작 및 스키마 검증 |
| **선행** | Phase 1 완료 |
| **작업** | ① pytest 설정: `backend/pytest.ini` 또는 `pyproject.toml`, `backend/tests/` 디렉터리<br>② `tests/test_api.py`: `TestClient`로 `/api/health`, `/api/beam-info`, `/api/beam-neighbors`, `/api/calculate` 호출. 정상 케이스 + `section_name`/`selected_member` 누락, 잘못된 `section_name` 등 엣지 케이스<br>③ (선택) `library` 단위 테스트: `calculate_design_strength`, `get_beam_info`, `get_neighbor_h_beams` 직접 호출 |
| **산출물** | `backend/tests/`, `test_api.py` 등 |
| **검증** | `cd backend && pytest` 통과 |

---

### 3.2 프론트엔드–백엔드 연동 및 회귀 테스트

| 항목 | 내용 |
|------|------|
| **목표** | 프론트·백엔드 동시 실행 시 BESTO 플로우 전 구간 회귀 테스트 |
| **선행** | Phase 2 완료, 3.1 |
| **작업** | ① 백엔드 `uvicorn` (port 8000), 프론트 `npm start` (port 3000) 동시 실행<br>② 수동 회귀: Search → 결과 목록·상세 확인, Design → 재계산·UI 반영, 섹션 선택·DetailDialog 등 기존 시나리오 수행<br>③ (선택) Jest + MSW 등으로 API 모킹 후 `App`·관련 컴포넌트 단위 테스트 보강<br>④ 네트워크 오류·타임아웃 시 사용자 메시지 확인 |
| **산출물** | 회귀 테스트 체크리스트 또는 결과 메모 |
| **검증** | 위 시나리오 모두 통과, 치명적 콘솔 에러 없음 |

---

### 3.3 API 문서·README 정리

| 항목 | 내용 |
|------|------|
| **목표** | Swagger/OpenAPI 자동 문서화 활용, README·개발 가이드 정리 |
| **선행** | Phase 1 완료 (FastAPI 기본 설정) |
| **작업** | ① FastAPI 기본 `/docs`, `/redoc` 확인 및 필요 시 `tags`·설명 보완<br>② 프로젝트 루트 `README.md`: Cloud V0.1 구조, `backend/`·`src/` 역할, 로컬 실행 방법 (`backend` uvicorn, `npm start`), `REACT_APP_API_URL` 안내<br>③ (선택) `docs/` 하에 로컬 개발·배포 절차 정리 |
| **산출물** | `README.md` 업데이트, (선택) `docs/` 내 개발 가이드 |
| **검증** | `http://localhost:8000/docs` 에서 엔드포인트·스키마 확인. 신규 개발자가 README만으로 실행 가능한지 확인 |

---

### Phase 3 체크리스트

- [x] 3.1 `backend` pytest 추가 및 `pytest` 통과
- [x] 3.2 프론트·백엔드 연동 회귀 테스트 체크리스트 작성 (`docs/REGRESSION_TEST_CHECKLIST.md`)
- [x] 3.3 API 문서(`/docs`) 및 README·개발 가이드 정리

---

## 부록

### A. API 스펙 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/calculate` | 설계강도 계산. Body = `pythonInput` 동일 JSON. 응답 = `DetailResult` 형태. |
| GET | `/api/beam-info?section_name=` | H형강 정보 조회 |
| GET | `/api/beam-neighbors?selected_member=` | 선택 부재 기준 이웃 H형강 목록 (Search용) |
| GET | `/api/health` | 서버 상태 확인 |

### B. 환경 변수

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `REACT_APP_API_URL` | 프론트 API base URL | `http://localhost:8000` |

### C. 예상 일정

- Phase 1: 1~2주  
- Phase 2: 약 1주  
- Phase 3: 약 1주  
- **총 3~4주**

### D. `utils_pyscript` 및 기타 코드

- **BESTO 계산 경로**: `utils_api`(또는 `api/endpoints`)만 사용. `utils_pyscript`는 BESTO 플로우에서 제거.
- **`utils_pyscript`**: SampleComponents·DevTools 등에서 MIDAS API 연동용으로 사용될 수 있음. Cloud V0.1에서는 **계산 이전**만 범위에 포함되므로, 해당 기능 유지 여부는 별도 결정. 유지할 경우 Pyscript 제거로 인해 비활성화될 수 있음.

---

*본 문서는 [CLOUD_MIGRATION_PLAN.md](./CLOUD_MIGRATION_PLAN.md)를 구현 단위로 풀어낸 단계별 개발 계획입니다.*
