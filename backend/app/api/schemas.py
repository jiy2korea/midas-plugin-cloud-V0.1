"""
API 요청/응답 스키마 (선택적 검증).
DetailResult 호환 응답은 dict로 반환, 엄격한 검증은 추후 확장.
"""
from typing import Any, Optional
from pydantic import BaseModel, Field


class CalculateRequest(BaseModel):
    """POST /api/calculate 요청 body (pythonInput 동일)."""
    selectedMember: str = Field(..., description="H형강 단면명 (예: H-600X200X11X17)")
    # 나머지 필드는 선택적. 누락 시 py_config.get_default_design_inputs()로 보완
    h_bracket_length: Optional[float] = None
    u_wing_width: Optional[float] = None
    slabDs: Optional[float] = None
    rebar_top_count: Optional[int] = None
    rebar_top_dia: Optional[str] = None
    rebar_bot_count: Optional[int] = None
    rebar_bot_dia: Optional[str] = None
    stud_spacing: Optional[float] = None
    angle_spacing: Optional[float] = None
    angle_height: Optional[float] = None
    stud_diameter: Optional[float] = None
    stud_strength: Optional[float] = None
    steel_elastic_modulus: Optional[float] = None
    steelH: Optional[str] = None
    steelU: Optional[str] = None
    concrete: Optional[str] = None
    rebar_yield_stress: Optional[float] = None
    endCondition: Optional[str] = None
    beamSupport: Optional[int] = None
    usageForVibration: Optional[str] = None
    liveLoadConstruction: Optional[float] = None
    deadLoadFinish: Optional[float] = None
    liveLoadPermanent: Optional[float] = None
    manualPositiveMoment: Optional[float] = None
    manualNegativeMoment: Optional[float] = None
    manualNegativeMomentU: Optional[float] = None
    manualShearForce: Optional[float] = None
    span_length: Optional[float] = None
    bay_spacing1: Optional[float] = None
    bay_spacing2: Optional[float] = None

    class Config:
        extra = "allow"  # 프론트에서 보내는 추가 필드 허용


class HealthResponse(BaseModel):
    """GET /api/health 응답."""
    status: str = "ok"
