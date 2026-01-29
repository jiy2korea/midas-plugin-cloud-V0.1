"""
BESTO Design Cloud API 라우트.
/api/calculate, /api/beam-info, /api/beam-neighbors, /api/health
"""
import json
import logging
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)

from library.py_main import get_beam_info as lib_get_beam_info
from library.py_main import get_neighbor_h_beams
from library.py_main import calculate_design_strength
from library.py_config import get_default_design_inputs

router = APIRouter()


@router.get("/health")
def get_health():
    """서버 상태 확인."""
    return {"status": "ok"}


@router.get("/beam-info")
def get_beam_info(section_name: str = Query(..., description="H형강 단면명")):
    """H형강 정보 조회. 없으면 404."""
    raw = lib_get_beam_info(section_name)
    data = json.loads(raw)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@router.get("/beam-neighbors")
def get_beam_neighbors(selected_member: str = Query(..., description="선택된 H형강 부재명")):
    """선택 부재 기준 이웃 H형강 목록 (Search 플로우용). 배열 반환."""
    raw = get_neighbor_h_beams(selected_member)
    data = json.loads(raw)
    if isinstance(data, dict) and "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@router.post("/calculate")
def post_calculate(body: dict):
    """
    설계강도 계산. Body = 기존 pythonInput 동일 JSON.
    누락 필드는 get_default_design_inputs()로 보완 후 계산.
    응답 = DetailResult 형태 JSON. 에러 시 422 또는 500.
    """
    try:
        config = get_default_design_inputs()
        config.update(body)
        raw = calculate_design_strength(config)
        result = json.loads(raw)
        if "error" in result and len(result) == 1:
            raise HTTPException(status_code=422, detail=result["error"])
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("POST /api/calculate 내부 오류")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

