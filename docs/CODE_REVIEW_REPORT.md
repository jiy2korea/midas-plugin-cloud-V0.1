# BESTO Design Cloud V0.1 — 코드 리뷰 보고서

Code Review Checklist 스킬 기준으로 프로젝트를 검토한 결과입니다.  
리뷰일: 2025-01-29

---

## 1. Pre-Review (컨텍스트)

| 항목 | 상태 | 비고 |
|------|:----:|------|
| 문제 정의 이해 | ✅ | Pyscript → FastAPI 백엔드 마이그레이션, 설계강도 계산 API화 |
| 요구사항·문서 | ✅ | CLOUD_MIGRATION_*.md, README, REGRESSION_TEST_CHECKLIST 정리됨 |
| 테스트 전략 | ✅ | 백엔드 pytest, 회귀 체크리스트, SectionList 단위 테스트 존재 |

---

## 2. Functionality (기능)

### 2.1 요구사항·로직

| 체크 | 항목 | 결과 |
|:----:|------|------|
| ✅ | Search → API(beam-neighbors, calculate) 호출로 부재 목록·결과 표시 | 정상 |
| ✅ | Design → 선택 부재 기준 postCalculate 후 UI 반영 | 정상 |
| ✅ | Health 체크 후 로딩 해제, 미연결 시 Validation 화면 | 정상 |
| ⚠️ | **에러 시 사용자 메시지** | `API_ERROR_MESSAGE` 등으로 일원화되어 있으나, 500 시 `detail`을 그대로 노출하지 않고 "서버 오류가 발생했습니다."로 처리됨 (client.ts) — 적절함 |

### 2.2 엣지 케이스·에러 처리

| 항목 | 상태 | 비고 |
|------|:----:|------|
| 빈 section list (Search 결과 0건) | ✅ | `sectionDataList` 빈 배열로 설정, UI에서 빈 목록 표시 |
| 개별 부재 계산 실패 (Search 중) | ✅ | try/catch로 스킵 후 다음 부재 계속, `console.error` 로깅 |
| `selectedSectionIndex === null` 인데 Design/Detail 클릭 | ✅ | alert로 "섹션을 먼저 선택해주세요." 안내 |
| API 타임아웃 | ✅ | client.ts 30초 AbortController, 408 시 한글 메시지 |
| 백엔드 422/500 | ✅ | response.ok false 시 detail 파싱 후 throw, App에서 alert |

### 2.3 개선 제안 (기능)

- **Search 시 로딩/진행 상태**: 여러 부재에 대해 순차 `postCalculate` 호출 시 UI에 로딩 또는 진행률 표시가 있으면 UX 개선 가능 (선택).
- **빈 neighbor 결과**: `getBeamNeighbors`가 빈 배열을 반환할 때 "검색 결과가 없습니다" 같은 명시 안내가 있으면 좋음.

---

## 3. Security (보안)

### 3.1 입력 검증·인젝션

| 체크 | 항목 | 결과 |
|:----:|------|------|
| ✅ | SQL 사용 없음 | 계산 엔진만 사용, DB 미사용 |
| ✅ | XSS | React 기본 이스케이프, 사용자 입력을 `dangerouslySetInnerHTML` 등으로 넣지 않음 |
| ⚠️ | **POST /api/calculate body 검증** | 현재 `body: dict`로 받고, `CalculateRequest` 스키마를 라우트에서 사용하지 않음. `get_default_design_inputs()` + `config.update(body)`로 임의 키가 그대로 전달됨. 내부 도구 전제면 허용 가능하나, 공개 API로 확장 시 Pydantic 모델로 검증 권장 |

**권장 (라우트에서 스키마 사용):**

```python
# routes.py
from app.api.schemas import CalculateRequest

@router.post("/calculate", ...)
def post_calculate(body: CalculateRequest):  # dict 대신 스키마
    config = get_default_design_inputs()
    config.update(body.model_dump(exclude_unset=True))
    ...
```

### 3.2 인증·비밀값

| 체크 | 항목 | 결과 |
|:----:|------|------|
| ✅ | API 키/비밀 하드코딩 없음 | `REACT_APP_API_URL`은 env, 기본값 localhost |
| ✅ | .gitignore | `.env`, `.env.local` 무시 |
| ⚠️ | **.env.development** | `.gitignore`에 없어 커밋 가능. 현재 내용은 `REACT_APP_API_URL=http://localhost:8000` 뿐이라 노출 위험은 낮으나, 팀 정책에 따라 `.env.development`를 ignore에 넣거나 “공개 가능한 기본값만 포함” 문서화 권장 |

### 3.3 CORS

- `allow_origins=["http://localhost:3000"]` 로 개발 환경에 맞게 제한됨. 운영 배포 시 실제 프론트 오리진으로 조정 필요.

---

## 4. Performance (성능)

| 항목 | 상태 | 비고 |
|------|:----:|------|
| ✅ | 불필요한 반복/쿼리 | N+1 DB 없음 (DB 미사용) |
| ⚠️ | **Search 시 순차 계산** | 이웃 부재 수만큼 `postCalculate`를 순차 호출. 부재 수가 많을 경우 병렬 호출(예: `Promise.all` + 배치) 또는 백엔드 `/api/calculate/batch` 도입 검토 가능 (현재 비목표) |
| ✅ | 메모리 | 대량 데이터 적재 없음, Map/배열 사용 적절 |
| ✅ | 타임아웃 | 30초로 제한되어 있어 장시간 블로킹 완화 |

---

## 5. Code Quality (코드 품질)

### 5.1 가독성·이름

| 항목 | 상태 | 비고 |
|------|:----:|------|
| ✅ | API: `getHealth`, `getBeamInfo`, `postCalculate` 등 역할이 드러남 | 좋음 |
| ✅ | 타입: `DetailResult`, `SearchInputs`, `SectionData` 등 정의·사용 일관됨 | 좋음 |
| ⚠️ | **Wrapper.tsx** | `ValidationComponent` 내부 `title = 'undefiend'` → 오타. `'undefined'` 또는 의미에 맞는 기본값 권장 |
| ⚠️ | **App.tsx** | `getDesignInitialData()` 내 `(data as any).parsedInputs` — 타입에 `parsedInputs`를 추가하거나, `DetailResult` 확장 타입으로 정의하면 any 제거 가능 |

### 5.2 구조·중복

| 항목 | 상태 | 비고 |
|------|:----:|------|
| ✅ | api/client.ts, endpoints.ts 분리 | 단일 책임 유지 |
| ✅ | 백엔드 app/api (routes, schemas), library 분리 | 계층 명확 |
| ✅ | pythonInput 조합 (Search/Design) | `basePythonInput` 등으로 정리됨, 중복 적음 |

### 5.3 유지보수성

- README, 마이그레이션 문서, 회귀 체크리스트가 있어 온보딩·재현이 쉬움.
- 백엔드 테스트가 엔드포인트별로 정리되어 있어 회귀 검증에 유리함.

---

## 6. Tests (테스트)

### 6.1 백엔드 (pytest)

| 체크 | 항목 | 결과 |
|:----:|------|------|
| ✅ | /api/health | 200, status ok |
| ✅ | /api/beam-info | 정상/미지원 section, 422(파라미터 누락), 404(없는 section) |
| ✅ | /api/beam-neighbors | 정상/422(파라미터 누락) |
| ✅ | /api/calculate | 정상 body, 빈 body, 잘못된 member 시 422/500 및 detail 존재 |

`conftest.py`에서 `backend_root`를 `sys.path`에 넣어 `library` import 가능 — 적절함.

### 6.2 프론트엔드

| 체크 | 항목 | 결과 |
|:----:|------|------|
| ✅ | SectionList.test.tsx | 렌더, 체크박스 선택 시 onSelect(0) 호출 검증 |
| ⚠️ | **API/통합** | API 클라이언트·App 플로우에 대한 단위/통합 테스트는 없음. 회귀는 수동 체크리스트로 보완 중 — 추후 `jest` + mock fetch로 `getHealth`/`postCalculate` 호출 시나리오 추가 시 유지보수에 유리 |

### 6.3 회귀

- `docs/REGRESSION_TEST_CHECKLIST.md`로 로딩, Search, Design, 에러 시나리오가 정의되어 있고, 2025-01-29 검증 완료 기록 있음.

---

## 7. Documentation & Git

| 항목 | 상태 | 비고 |
|------|:----:|------|
| ✅ | README | 실행 방법, API 요약, Phase 정리, 참조 문서 링크 |
| ✅ | API 문서 | FastAPI /docs, /redoc |
| ✅ | 주석 | client.ts, endpoints.ts, routes.py 등 요약 주석 있음 |
| ⚠️ | **Commit 메시지** | 프로젝트 규칙상 한글 메시지 시 UTF-8 파일 + `git commit -F` 사용 권장 (git-commit-encoding 규칙) |

---

## 8. 요약 체크리스트

| 영역 | 통과 | 개선 권장 |
|------|:----:|------------|
| Pre-Review | ✅ | - |
| Functionality | ✅ | Search 로딩/빈 결과 안내 (선택) |
| Security | ✅ | calculate body Pydantic 검증 반영 완료. .env.development 정책은 선택. |
| Performance | ✅ | Search 병렬/배치 (추후) |
| Code Quality | ✅ | Wrapper 오타·App any 제거 반영 완료. |
| Tests | ✅ | 프론트 API/App 테스트 확대 (선택) |
| Documentation | ✅ | - |

---

## 9. 권장 조치 (우선순위)

1. **높음** ✅ 반영 완료 (2025-01-29)  
   - **POST /api/calculate**  
     - `body: dict` → `body: CalculateRequest`로 변경해 Pydantic 검증 적용.  
   - **Wrapper.tsx**  
     - `'undefiend'` → `'undefined'`로 수정.

2. **중간** ✅ App.tsx 반영 완료 (2025-01-29)  
   - **App.tsx**  
     - `DetailResult`에 `parsedInputs` 타입 추가 (`ParsedInputs`, `ParsedInputsHSection`, `ParsedInputsUSection`). `(data as any).parsedInputs` 제거 후 `data.parsedInputs` 사용.  
   - **.env.development**  
     - `.gitignore` 추가 여부 팀 정책에 맞게 결정 후 문서화.

3. **낮음**  
   - Search 시 로딩/진행 표시, 빈 neighbor 결과 안내 문구.  
   - 프론트에서 API 호출 시나리오 단위/통합 테스트 추가.

---

*Code Review Checklist 스킬 기준 적용. 2025-01-29 높음·App.tsx 권장 사항 반영 완료.*
