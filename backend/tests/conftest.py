"""pytest fixtures. TestClient는 app.main:app 사용."""
import sys
from pathlib import Path

# backend 루트를 PYTHONPATH에 추가 (library import 위해)
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from fastapi.testclient import TestClient

from app.main import app


def get_client() -> TestClient:
    return TestClient(app)
