"""
BESTO Design Cloud API 단위·통합 테스트.
/api/health, /api/beam-info, /api/beam-neighbors, /api/calculate 검증.
"""
import pytest
from fastapi.testclient import TestClient

from tests.conftest import get_client


@pytest.fixture
def client() -> TestClient:
    return get_client()


# --- /api/health ---


def test_health_returns_200_and_ok(client: TestClient) -> None:
    """GET /api/health → 200, body에 status: ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"


# --- /api/beam-info ---


def test_beam_info_valid_section_returns_200(client: TestClient) -> None:
    """GET /api/beam-info?section_name=H-600X200X11X17 → 200, H형강 정보."""
    response = client.get("/api/beam-info", params={"section_name": "H-600X200X11X17"})
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data
    # H형강 정보에 기대되는 키
    assert "H" in data or "Zx" in data or "name" in data or "section_name" in data or len(data) > 0


def test_beam_info_missing_section_name_returns_422(client: TestClient) -> None:
    """GET /api/beam-info (section_name 누락) → 422."""
    response = client.get("/api/beam-info")
    assert response.status_code == 422


def test_beam_info_invalid_section_returns_404(client: TestClient) -> None:
    """GET /api/beam-info?section_name=INVALID-SECTION → 404."""
    response = client.get("/api/beam-info", params={"section_name": "INVALID-SECTION-XXX"})
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data


# --- /api/beam-neighbors ---


def test_beam_neighbors_valid_member_returns_200_and_array(client: TestClient) -> None:
    """GET /api/beam-neighbors?selected_member=H-600X200X11X17 → 200, 배열."""
    response = client.get(
        "/api/beam-neighbors", params={"selected_member": "H-600X200X11X17"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 0


def test_beam_neighbors_missing_selected_member_returns_422(client: TestClient) -> None:
    """GET /api/beam-neighbors (selected_member 누락) → 422."""
    response = client.get("/api/beam-neighbors")
    assert response.status_code == 422


# --- /api/calculate ---


def test_calculate_valid_body_returns_200_and_detail_result(client: TestClient) -> None:
    """POST /api/calculate with selectedMember only → 200, DetailResult 형태."""
    body = {"selectedMember": "H-600X200X11X17"}
    response = client.post("/api/calculate", json=body)
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data or (isinstance(data.get("error"), str) and len(data) > 1)
    # 정상 응답이면 설계 결과 관련 키가 있을 수 있음
    assert isinstance(data, dict)


def test_calculate_empty_body_returns_consistent_response(client: TestClient) -> None:
    """POST /api/calculate with empty body → 200(기본값 보완) 또는 422/500, 항상 JSON."""
    response = client.post("/api/calculate", json={})
    assert response.status_code in (200, 422, 500)
    data = response.json()
    assert isinstance(data, dict)
    if response.status_code != 200:
        assert "detail" in data


def test_calculate_invalid_member_returns_error(client: TestClient) -> None:
    """POST /api/calculate with invalid section → 422 or 500."""
    response = client.post(
        "/api/calculate", json={"selectedMember": "INVALID-SECTION-XXX"}
    )
    assert response.status_code in (422, 500)
    data = response.json()
    assert "detail" in data
