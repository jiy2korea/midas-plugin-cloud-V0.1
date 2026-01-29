# CLOUD 마이그레이션 개발 계획 — 스킬 추천

이 문서는 [CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md](./CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md)를 수행할 때 **Cursor Agent 스킬(using-superpowers 기준)** 중 어떤 것을, 언제 사용하면 좋은지 정리한 것입니다.  
작업 시작 시 해당 스킬을 먼저 로드한 뒤 계획서의 단계·체크리스트·검증을 따르면 안정적으로 진행할 수 있습니다.

---

## 📌 사용 원칙

- **using-superpowers**: “적용 가능성이 1%라도 있으면 해당 스킬을 반드시 호출”하라는 원칙을 따릅니다.
- **executing-plans**: 이미 작성된 구현 계획이 있으므로, “계획 로드 → 배치 실행 → 검증 → 리뷰” 흐름을 따릅니다.
- **verification-before-completion**: 각 Phase/작업 완료 시 “완료”라고 말하기 전에 **검증 명령을 반드시 실행**하고, 그 결과를 근거로 보고합니다.

---

## 1. 전체 진행 방식 (우선 사용)

| 스킬 | 용도 |
|------|------|
| **executing-plans** | 작성된 구현 계획(CLOUD_MIGRATION_IMPLEMENTATION_PLAN)을 단계별로 실행할 때. “계획 로드 → 배치 실행 → 검증 → 리뷰” 흐름을 따르면 Phase 1~3를 체계적으로 진행할 수 있음. |
| **verification-before-completion** | 각 Phase/작업 완료 시 `curl`, `pytest`, `npm start` 등 **검증 명령을 반드시 실행**하고, 그 결과를 보고 “완료”라고 말할 때. 계획서의 “검증” 항목과 정합성 유지. |

---

## 2. Phase 1: 백엔드 (FastAPI, REST API)

| 스킬 | 용도 |
|------|------|
| **python-patterns** | FastAPI 선택·프로젝트 구조, type hints, async 여부 등 백엔드 설계/구현 시 결정 기준. 1.1~1.4 전반에 적용. |
| **api-patterns** | REST 설계(경로·메서드·상태코드), 요청/응답 형식, 에러 포맷, CORS·문서화(OpenAPI) 등. 1.3·1.4의 API·스키마·CORS 작업에 직접 대응. |

---

## 3. Phase 2: 프론트엔드 (React, API 클라이언트)

| 스킬 | 용도 |
|------|------|
| **react-patterns** | App.tsx의 Search/Design 플로우, API 호출·상태·에러 처리, 훅/컴포넌트 구조. 2.1·2.2·2.3의 “API 클라이언트 + 계산 경로 전환”에 적용. |
| **react-ui-patterns** *(선택)* | 로딩·에러·비동기 데이터 처리 UI. 2.2 에러 메시지, 2.3 로딩 화면 정리 시 참고. |

---

## 4. Phase 3: 테스트·문서

| 스킬 | 용도 |
|------|------|
| **testing-patterns** | 3.1 백엔드 pytest 구조, 테스트 작성 방식, 모킹. 3.2 Jest+MSW 등 프론트 테스트 보강 시에도 패턴 참고. |
| **documentation-templates** | 3.3 README 구조, Quick Start, 설정(REACT_APP_API_URL 등), API 문서 링크. “신규 개발자가 README만으로 실행” 검증에 맞춤. |

---

## 5. 보조·선택 스킬

| 스킬 | 언제 쓰면 좋은지 |
|------|------------------|
| **api-security-best-practices** | 1.4 입력 검증·CORS·에러 메시지 노출 등 보안 관점으로 점검할 때. |
| **api-documentation-generator** | 3.3에서 `/docs` 외에 별도 API 문서를 생성·정리할 때. |

---

## 6. 단계별 “먼저 켜면 좋은” 스킬 요약

| 시점 | 추천 스킬 |
|------|-----------|
| **지금 단계부터** | **executing-plans**, **verification-before-completion** |
| **Phase 1 들어갈 때** | **python-patterns**, **api-patterns** |
| **Phase 2 들어갈 때** | **react-patterns** |
| **Phase 3 들어갈 때** | **testing-patterns**, **documentation-templates** |

---

## 7. 참조

- [CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md](./CLOUD_MIGRATION_IMPLEMENTATION_PLAN.md) — 단계별 개발 계획
- [CLOUD_MIGRATION_PLAN.md](./CLOUD_MIGRATION_PLAN.md) — 상위 마이그레이션 계획
- `.cursor/skills/skills/using-superpowers/SKILL.md` — 스킬 사용 원칙

---

*이 문서는 CLOUD_MIGRATION_IMPLEMENTATION_PLAN 수행 시 Agent가 참고할 스킬 매핑을 문서화한 것입니다.*
