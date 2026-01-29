# MIDAS Plugin Cloud V0.1 - 클라우드 마이그레이션 개발 계획

## 📋 프로젝트 개요

현재 V5 버전은 **Pyscript (Pyodide)**를 사용하여 브라우저에서 직접 Python 계산을 수행합니다.  
Cloud V0.1 버전은 모든 계산 기능을 **별도의 백엔드 서버**로 분리하여 클라우드 아키텍처로 전환합니다.

### MIDAS Open API 연동 개요

MIDAS CIVIL NX Open API는 **클라이언트(플러그인) → REST(헤더 `MAPI-Key`) → moa-engineers(AWS) → WebSocket → 로컬 MIDAS CIVIL NX** 구조로 동작합니다. 서버(AWS)가 MIDAS 제품과 애플리케이션 사이 중개자 역할을 합니다. **MAPI-Key**는 연결된 MIDAS 인스턴스(WebSocket 클라이언트)를 식별하는 용도이며, 임시 키로 언제든 변경 가능합니다.  
**Cloud V0.1 백엔드는 이 체인에 포함되지 않습니다.** 입력 JSON 수신 → 계산 → 결과 반환만 수행하므로 MIDAS API·MAPI-Key를 사용하지 않습니다.

---

## 📌 이해 요약 (Understanding Summary)

- **무엇을**: V5의 Pyscript 기반 설계 계산을 백엔드 서버로 이전한 Cloud V0.1 구축
- **왜**: 브라우저 부담 감소, 서버 측 최적화·스케일링, 계산 로직과 UI 로직의 명확한 분리
- **대상 사용자**: MIDAS 플러그인 사용자 (기존 V5와 동일)
- **BESTO 계산**: UI에서 넘긴 입력(`pythonInput`)만 사용하며, **MIDAS API 호출 없음**. MAPI-Key는 MIDAS 연동(모델 DB 조회 등) 용도로만 사용.
- **비목표 (V0.1 범위 외)**: API 인증/멀티테넌트, 대규모 동시 접속 스케일링

---

## 🎯 목표

### 주요 목표
1. **계산 로직 서버 분리**: 프론트엔드에서 수행되던 모든 설계 계산을 백엔드 서버로 이동
2. **성능 개선**: 브라우저 리소스 부담 감소 및 서버 측 최적화 가능
3. **확장성 향상**: 서버 측에서 계산 리소스 관리 및 스케일링 가능
4. **유지보수성 향상**: 계산 로직과 UI 로직의 명확한 분리

### 기술적 목표
- Pyscript 의존성 제거
- RESTful API 기반 통신
- 백엔드 서버 구축 (Python FastAPI/Flask)
- 프론트엔드 API 클라이언트 구현

---

## 📋 가정 (Assumptions)

| 가정 | 비고 |
|------|------|
| **Cloud V0.1 백엔드는 MIDAS API를 호출하지 않으며 MAPI-Key 불필요** | MAPI-Key는 플러그인↔moa-engineers 통신 시 MIDAS 인스턴스 식별용이며, 백엔드는 해당 통신에 관여하지 않음. BESTO 계산은 입력 JSON만 사용. |
| **설계 기본값은 백엔드에서 정의·적용** | 누락 필드는 백엔드 기본값으로 보완. 하나라도 빠지면 계산 에러 가능·변경 필요 시 대비해 백엔드 보유. |
| 프론트가 MIDAS API 사용 시(모델 DB 조회 등) MAPI-Key는 **프론트(또는 마이다스 측) 전용** | 백엔드와 무관 |
| 클라우드 배포 시 **프론트는 마이다스 측 서버**, **백엔드는 별도 서버**에 구축될 것으로 가정 | 플러그인은 MIDAS(로컬)에서 실행, 데이터는 백엔드로 전송 후 계산·반환 |
| V0.1에서는 API 인증(API Key/로그인) 없이 진행 가능 | 보안 요구 시 별도 단계로 추가 |
| 개발 환경은 로컬(프론트 3000, 백 8000), CORS는 프론트 origin만 허용 | 운영 환경(도메인, CORS)은 배포 단계에서 정의 |
| 동시 사용자는 소수(팀 내부·수십 명 수준) | 대규모 동시 접속 필요 시 부하·스케일 설계 추가 |
| **다수 부재 계산은 순차 호출로 확정** | 배치 API(`/api/calculate/batch`) 없이 부재별 `POST /api/calculate` 순차 호출. **다수 부재 계산(배치)은 추후 구현 예정**. |
| `py_base.py`, `py_base_sub.py`는 **백엔드에 두지 않고** 프론트/별도 레이어에서만 사용 | MIDAS API(moa-engineers) 연동용; 계산 로직과 분리 |

---

## 📐 비기능 요구사항 (NFR)

| 항목 | 내용 |
|------|------|
| **성능** | `/api/calculate` 1회 호출 응답 지연 목표: 5초 이내 (복잡한 부재 기준, 추후 측정 후 조정 가능) |
| **규모** | 동시 사용자·요청은 소규모(팀/내부용) 전제 |
| **보안** | V0.1은 내부망/개발용 전제; 공개 시 HTTPS·인증은 별도 단계에서 적용 |
| **가용성** | 개발/내부용 수준; SLA·목표 가동률은 미정의 |
| **유지보수** | 배포·운영 담당은 프로젝트/팀 내부에서 정의 |

---

## ❓ 미해결 질문 (Open Questions)

구현 전에 결론을 내릴 항목. 결정 후 본 문서의 **가정** 또는 **결정 로그**에 반영할 것.

| # | 질문 | 상태 |
|---|------|------|
| 1 | **MIDAS API / MAPI-Key**: 백엔드에서 MIDAS API 호출·MAPI-Key 사용 **불필요** (BESTO 계산 경로 확정). 프론트의 MIDAS 연동(db_read 등) 유지 여부·MAPI-Key 사용 방식은 **프론트/배포 정책**으로 유지. | ☑ 결론 반영 (가정·결정 로그 참조) |
| 2 | **배치 계산**: **순차 호출로 확정**. Phase 1~2에는 `/api/calculate/batch` 미도입. 다수 부재 계산 시 부재별 `POST /api/calculate` 순차 호출. **다수 부재 계산(배치) 기능은 추후 구현 예정**. | ☑ 결론 반영 (가정·결정 로그 참조) |
| 3 | **`py_config` / `py_base_sub` / `py_config.json`**: **`py_config.py`** → 백엔드 이전(설계 기본값 유지·적용). **`py_config.json`** → Pyscript 전용(fetch/files). Cloud에서 Pyscript 제거하므로 **사용 안 함, 제거**. **`py_base`·`py_base_sub`** → 백엔드 미이전(프론트/별도 레이어 전용). | ☑ 결론 반영 (가정·결정 로그·프로젝트 구조 참조) |

---

## 🏗️ 아키텍처 설계

### 현재 아키텍처 (V5)
```
┌─────────────────────────────────────┐
│     브라우저 (React Frontend)       │
│  ┌──────────────────────────────┐ │
│  │  App.tsx                      │ │
│  │  - UI 로직                    │ │
│  │  - Pyscript 호출              │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │  Pyscript (Pyodide)          │ │
│  │  - py_main.py                │ │
│  │  - py_library.py             │ │
│  │  - 계산 실행                 │ │
│  └──────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 목표 아키텍처 (Cloud V0.1)
```
┌─────────────────────────────────────┐
│     브라우저 (React Frontend)       │
│  ┌──────────────────────────────┐ │
│  │  App.tsx                      │ │
│  │  - UI 로직                    │ │
│  │  - API 클라이언트             │ │
│  └───────────┬──────────────────┘ │
└──────────────┼─────────────────────┘
               │ HTTP/REST API (JSON)
┌──────────────┼─────────────────────┐
│              ▼                      │
│  ┌──────────────────────────────┐ │
│  │  백엔드 서버 (FastAPI/Flask) │ │
│  │  - API 엔드포인트            │ │
│  │  - 계산 엔진 (py_library 등) │ │
│  └──────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📁 프로젝트 구조 (예상)

- **백엔드 `library/`**: 계산용 `py_library.py`, `py_main.py`, **`py_config.py`**(설계 기본값) 이동. **`py_base.py`, `py_base_sub.py`는 백엔드에 두지 않음** (MIDAS API 연동용, 프론트/별도 레이어 전용).
- **`py_config.json`**: Pyscript 전용 설정(fetch/files, 로드할 .py 목록). Cloud에서 Pyscript 제거하므로 **사용 안 함, 제거**.

```
Midas Plugin Cloud V0.1/
├── frontend/                    # React 프론트엔드 (현재 src/ 기준)
│   ├── src/
│   │   ├── components/          # UI 컴포넌트 (기존 유지)
│   │   ├── api/                 # API 클라이언트 (신규)
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── utils/
│   │   │   └── utils_api.ts     # utils_pyscript.ts 대체
│   │   └── App.tsx              # API 호출로 변경
│   └── package.json             # Pyscript 의존성 제거
│
├── backend/                     # Python 백엔드 서버 (신규)
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── routes.py
│   │   │   └── schemas.py
│   │   └── services/
│   │       └── calculation.py
│   ├── library/                 # 기존 계산 로직 이동
│   │   ├── py_library.py
│   │   ├── py_main.py
│   │   └── py_config.py
│   ├── requirements.txt
│   └── (선택) Dockerfile
│
├── docs/
├── public/
├── CLOUD_MIGRATION_PLAN.md      # 본 문서
└── README.md
```

---

## 🔄 마이그레이션 단계

### Phase 1: 백엔드 서버 구축 (1~2주)

| 단계 | 작업 | 체크 |
|------|------|------|
| 1.1 | `backend/` 디렉터리 및 FastAPI/Flask 프로젝트 생성 | ☑ |
| 1.2 | `public/py_library.py`, `py_main.py`, `py_config.py` → `backend/library/` 이동 | ☑ |
| 1.3 | API 엔드포인트 구현: `/api/calculate`, `/api/beam-info`, `/api/health` | ☑ |
| 1.4 | 입력/출력 스키마 및 에러 처리, CORS 설정 | ☑ |

*`py_base.py`, `py_base_sub.py`는 백엔드로 이전하지 않음. `py_config.json`은 Pyscript 전용이므로 Cloud에서 사용 안 함(제거).*

### Phase 2: 프론트엔드 수정 (약 1주)

| 단계 | 작업 | 체크 |
|------|------|------|
| 2.1 | `src/api/client.ts`, `endpoints.ts` API 클라이언트 구현 | ☑ |
| 2.2 | `App.tsx`에서 Pyscript 호출 제거 후 API 호출로 교체 | ☑ |
| 2.3 | `public/index.html`에서 Pyscript·`py-config`(py_config.json) 제거, `utils_pyscript.ts` → `utils_api.ts` 대체 | ☑ |
| 2.4 | `package.json` Pyscript 관련 의존성 제거, HTTP 클라이언트(axios 등) 추가 | ☑ |

### Phase 3: 통합 테스트 및 정리 (약 1주)

| 단계 | 작업 | 체크 |
|------|------|------|
| 3.1 | 백엔드 단독 실행 및 API 테스트 | ☑ |
| 3.2 | 프론트엔드–백엔드 연동 및 기존 기능 회귀 테스트 | ☑ |
| 3.3 | API 문서(Swagger/OpenAPI), README·개발 가이드 정리 | ☑ |

---

## 🧪 테스트 전략

| 구분 | 내용 |
|------|------|
| **백엔드** | `/api/calculate`, `/api/beam-info`, `/api/health`에 대한 단위·통합 테스트 (예: pytest, 요청/응답 스키마 검증). 엣지 케이스(필수 필드 누락, 잘못된 section_name 등) 포함. |
| **프론트엔드** | 기존 Jest + React Testing Library 유지. API 호출부는 모킹(MSW 등)하여 UI 동작 회귀 검증. |
| **통합·E2E** | Phase 3에서 프론트–백 연동 수동 회귀 테스트 수행. 필요 시 Playwright 등 E2E 자동화 검토. |

---

## 🔧 기술 스택

### 백엔드
- **프레임워크**: FastAPI 권장 (자동 API 문서, 타입 힌팅, 비동기)
- **Python**: 3.9+
- **의존성**: pip + requirements.txt

### 프론트엔드
- **HTTP 클라이언트**: Axios 또는 Fetch API
- **타입**: TypeScript 인터페이스 유지
- **에러 처리**: try/catch 및 사용자 메시지

### 개발 환경
- 백엔드: `http://localhost:8000` (기본)
- 프론트엔드: `http://localhost:3000`
- CORS: 개발 시 프론트엔드 origin 허용

---

## 📜 결정 로그 (Decision Log)

| 결정 | 대안 | 선택 이유 |
|------|------|-----------|
| **백엔드: MIDAS API 미사용, MAPI-Key 불필요** | 백엔드에서 MIDAS API 호출 | BESTO 계산이 입력 JSON만 사용하고 MIDAS API를 호출하지 않음. 데이터 수신→계산→반환만 수행. |
| **`py_config.py`(설계 기본값): 백엔드 보유·적용** | 프론트만 기본값 적용 | 누락 필드 시 계산 에러 가능·변경 필요 대비. 백엔드에서 기본값으로 보완 후 계산. |
| **`py_config.json`: Cloud 미사용(제거)** | 백엔드 설정으로 활용 등 | Pyscript 전용(fetch/files). Cloud 전환 시 Pyscript 제거로 불필요. |
| **다수 부재 계산: 순차 호출** | `/api/calculate/batch` 도입 | V0.1에서는 부재별 `POST /api/calculate` 순차 호출. 다수 부재 계산(배치)은 추후 구현 예정. |
| 백엔드 프레임워크 | FastAPI vs Flask | FastAPI: 자동 API 문서, 타입 힌팅, 비동기 지원 |
| 통신 방식 | REST/JSON vs GraphQL | 기존 입출력 구조와 단순 매핑, 도구·클라이언트 지원 용이 |
| HTTP 클라이언트(프론트) | Axios vs Fetch | Axios: 인터셉터, 타임아웃·에러 처리 편의 (또는 Fetch로 통일 가능) |

*미해결 질문은 모두 결론 반영 완료.*

---

## 📝 주요 변경 사항

### 1. 계산 호출 방식

**기존 (V5)**  
`App.tsx`에서 `checkPyScriptReady` → `pyscript.interpreter.globals.get('calculate_design_strength')` 호출.

**변경 후 (Cloud V0.1)**  
`calculateDesignStrength(pythonInput)` 같은 API 함수로 HTTP POST `/api/calculate` 호출.

### 2. API 스펙 (예시)

- **POST /api/calculate**  
  - Request: 기존 `pythonInput`와 동일한 JSON (selectedMember, h_height, slabDs 등). **누락 필드는 백엔드 기본값**(`py_config` 계열)으로 보완 후 계산.
  - Response: 기존 `DetailResult`와 동일한 JSON (에러 시 `error` 필드)
  - **다수 부재**: 부재별 `POST /api/calculate` **순차 호출**. 다수 부재 계산(배치)은 추후 구현 예정.

- **GET /api/beam-info?section_name=...**  
  - H형강 정보 조회

- **GET /api/health**  
  - 서버 상태 확인

### 3. MIDAS API · MAPI-Key
- **BESTO 설계 계산**에는 MIDAS API 호출이 없으며, **백엔드에서 MAPI-Key 불필요**.
- `py_base.py` / `py_base_sub.py`(MIDAS API 연동)는 **백엔드로 이전하지 않고** 프론트 또는 별도 레이어에서만 사용. 프론트가 MIDAS API를 쓸 경우 MAPI-Key는 프론트(또는 마이다스 측)에서만 사용.
- 연동 구조·MAPI-Key 역할: **프로젝트 개요 → MIDAS Open API 연동 개요** 및 [MIDAS CIVIL NX Open API 작동 방법](https://support.midasuser.com/hc/ko/articles/30212837484441-How-to-work-MIDAS-CIVIL-NX-Open-API) 참조.

### 4. 설계 기본값 · py_config
- **`py_config.py`**: 설계 기본값(`get_default_design_inputs`) 정의. **백엔드로 이전**하여 보유·적용. 요청 시 누락 필드는 기본값으로 보완. 필요 시 백엔드에서 변경.
- **`py_config.json`**: Pyscript 전용(fetch/files). **Cloud에서 사용 안 함, 제거**.

---

## ⚠️ 주의사항

- **환경 변수**: 백엔드 URL은 `REACT_APP_API_URL` 등으로 관리.
- **배치 계산**: **순차 호출로 확정**. 다수 부재 계산은 추후 구현 예정.
- **에러·타임아웃**: 네트워크/서버 오류 처리 및 타임아웃 설정 필수.

---

## 🔀 에러·엣지 케이스

| 상황 | 대응 |
|------|------|
| **네트워크** | 클라이언트 타임아웃(예: 30초), 필요 시 재시도 정책 검토; 사용자 메시지 예: "연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요." |
| **4xx/5xx** | 400/422(잘못된 입력): 검증 메시지 반환; 500(서버 오류): 일반 안내 메시지 + 로그 수집. |
| **엣지** | `section_name` 없음·필수 필드 누락 시 400 + 메시지; 계산 중 서버 재시작 등은 재시도 또는 사용자 재요청 유도. |

---

## 📅 예상 일정

- Phase 1: 1~2주  
- Phase 2: 약 1주  
- Phase 3: 약 1주  
- **총 3~4주**

---

## 📚 참고

- **MIDAS CIVIL NX Open API (작동 방법)**: https://support.midasuser.com/hc/ko/articles/30212837484441-How-to-work-MIDAS-CIVIL-NX-Open-API
- FastAPI: https://fastapi.tiangolo.com/
- Axios: https://axios-http.com/
- CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

*본 문서는 V5 프로젝트를 복사한 뒤 클라우드 버전 전환을 위해 작성되었습니다.*  
*실제 경로가 `C:\Besto Designer\Midas Plugin Cloud V0.1`이 아니라 워크스페이스 내 `Midas Plugin Cloud V0.1`인 경우, 배포 시 해당 폴더를 원하는 위치로 이동하면 됩니다.*
