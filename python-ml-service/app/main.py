import os
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.analytics import analytics_router, run_etl_pipeline
from app.ml_model import (
    DEFAULT_DATASET_PATH,
    ensure_dataset,
    predict_with_model,
    train_model,
)

from app.analytics import (
    get_at_risk_projects,
    get_delay_risk_per_project,
    get_developer_utilization_heatmap,
    get_sprint_velocity_trends,
)

app = FastAPI(title="Project Intelligence ML Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)

PREDICTION_MODE = os.getenv("PREDICTION_MODE", "RULE_BASED").upper()
ML_MODEL_TYPE = os.getenv("ML_MODEL", "logreg").lower()
DATASET_PATH = Path(os.getenv("DATASET_PATH", str(DEFAULT_DATASET_PATH)))
MODEL_ARTIFACTS = None
MODEL_ERROR = None

if PREDICTION_MODE == "ML":
    try:
        dataset_path = ensure_dataset(DATASET_PATH)
        MODEL_ARTIFACTS = train_model(dataset_path, model_type=ML_MODEL_TYPE)
    except Exception as exc:
        MODEL_ERROR = str(exc)

class PredictionRequest(BaseModel):
    sprint_velocity: float = Field(..., ge=0)
    task_completion_rate: float = Field(..., ge=0, le=100)
    team_utilization: float = Field(..., ge=0, le=100)
    days_remaining: int = Field(..., ge=0)


class PredictionResponse(BaseModel):
    delay_probability: int
    status: str
    risk_level: Literal["LOW", "MODERATE", "HIGH"]


class ProjectDelayRiskRow(BaseModel):
    project_id: int
    project_name: str | None = None
    delay_probability: int
    status: str
    risk_level: Literal["LOW", "MODERATE", "HIGH"]


class SprintVelocityRow(BaseModel):
    project_id: int
    sprint_name: str
    start_date: str
    end_date: str
    velocity: float


class DeveloperUtilizationRow(BaseModel):
    project_id: int
    developer_id: int
    developer_name: str
    sprint_name: str
    utilization_pct: float


def rule_based_prediction(payload: PredictionRequest) -> PredictionResponse:
    # Simple rule-based logic from the project spec.
    if payload.sprint_velocity > 50 and payload.task_completion_rate > 80 and payload.team_utilization < 85:
        base_probability = 15
        risk_level = "LOW"
        status = "On Track"
    elif (
        30 <= payload.sprint_velocity <= 50
        and 60 <= payload.task_completion_rate <= 80
        and 85 <= payload.team_utilization <= 95
    ):
        base_probability = 45
        risk_level = "MODERATE"
        status = "Moderate Risk"
    else:
        base_probability = 80
        risk_level = "HIGH"
        status = "At Risk - Review Sprint Plan"

    if payload.days_remaining < 5:
        base_probability += 10

    delay_probability = max(1, min(99, int(base_probability)))
    return PredictionResponse(
        delay_probability=delay_probability,
        status=status,
        risk_level=risk_level,
    )

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/model")
def model_info() -> dict:
    return {
        "prediction_mode": PREDICTION_MODE,
        "model_type": getattr(MODEL_ARTIFACTS, "model_type", None),
        "dataset_path": str(DATASET_PATH),
        "model_ready": MODEL_ARTIFACTS is not None,
        "model_error": MODEL_ERROR,
    }


def _predict_single(velocity: float, completion_rate: float, utilization: float, days_remaining: int) -> dict:
    payload = PredictionRequest(
        sprint_velocity=velocity,
        task_completion_rate=completion_rate,
        team_utilization=utilization,
        days_remaining=days_remaining,
    )

    if PREDICTION_MODE == "ML" and MODEL_ARTIFACTS is not None:
        result = predict_with_model(
            MODEL_ARTIFACTS,
            sprint_velocity=payload.sprint_velocity,
            task_completion_rate=payload.task_completion_rate,
            team_utilization=payload.team_utilization,
            days_remaining=payload.days_remaining,
        )
        return {
            "delay_probability": result.delay_probability,
            "status": result.status,
            "risk_level": result.risk_level,
        }

    rule = rule_based_prediction(payload)
    return {
        "delay_probability": rule.delay_probability,
        "status": rule.status,
        "risk_level": rule.risk_level,
    }


@app.get("/analytics/delay-risk-per-project", response_model=list[ProjectDelayRiskRow])
def analytics_delay_risk_per_project() -> list[dict]:
    base = Path(__file__).resolve().parents[1] / "data"
    return get_delay_risk_per_project(
        projects_path=base / "projects.csv",
        metrics_path=base / "project_metrics.csv",
        predict_fn=_predict_single,
    )


@app.get("/analytics/at-risk-projects", response_model=list[ProjectDelayRiskRow])
def analytics_at_risk_projects(threshold: int = Query(70, ge=1, le=99)) -> list[dict]:
    rows = analytics_delay_risk_per_project()
    return get_at_risk_projects(rows, threshold=threshold)


@app.get("/analytics/sprint-velocity", response_model=list[SprintVelocityRow])
def analytics_sprint_velocity(project_id: int | None = Query(None, ge=1)) -> list[dict]:
    base = Path(__file__).resolve().parents[1] / "data"
    return get_sprint_velocity_trends(base / "sprints.csv", project_id=project_id)


@app.get("/analytics/developer-utilization", response_model=list[DeveloperUtilizationRow])
def analytics_developer_utilization(project_id: int | None = Query(None, ge=1)) -> list[dict]:
    base = Path(__file__).resolve().parents[1] / "data"
    return get_developer_utilization_heatmap(base / "developer_utilization.csv", project_id=project_id)


@app.post("/predict", response_model=PredictionResponse)
def predict_delay_risk(payload: PredictionRequest) -> PredictionResponse:
    if PREDICTION_MODE == "ML" and MODEL_ARTIFACTS is not None:
        result = predict_with_model(
            MODEL_ARTIFACTS,
            sprint_velocity=payload.sprint_velocity,
            task_completion_rate=payload.task_completion_rate,
            team_utilization=payload.team_utilization,
            days_remaining=payload.days_remaining,
        )
        return PredictionResponse(
            delay_probability=result.delay_probability,
            status=result.status,
            risk_level=result.risk_level,
        )

    return rule_based_prediction(payload)

