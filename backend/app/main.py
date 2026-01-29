from fastapi import FastAPI

from app.api import routes as api_routes

app = FastAPI(title="BESTO Design Cloud API")

app.include_router(api_routes.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "BESTO Design Cloud API"}
