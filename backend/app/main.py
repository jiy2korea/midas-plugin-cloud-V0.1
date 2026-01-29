from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes as api_routes

app = FastAPI(title="BESTO Design Cloud API")

# CORS: 개발 시 프론트(localhost:3000)에서 API 호출 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_routes.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "BESTO Design Cloud API"}
