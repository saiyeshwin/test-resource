from __future__ import annotations

import io
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

analytics_router = APIRouter(prefix="/etl", tags=["etl"])


def load_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"CSV not found: {path}")
    return pd.read_csv(path)


def get_delay_risk_per_project(
    projects_path: Path,
    metrics_path: Path,
    predict_fn,
) -> list[dict]:
    """Return delay risk % per project.

    predict_fn: callable that takes (velocity, completion_rate, utilization, days_remaining)
    and returns a dict-like {delay_probability, status, risk_level}.
    """

    projects = load_csv(projects_path)
    metrics = load_csv(metrics_path)

    merged = metrics.merge(projects, on="project_id", how="left")

    results: list[dict] = []
    for _, row in merged.iterrows():
        pred = predict_fn(
            float(row["sprint_velocity"]),
            float(row["task_completion_rate"]),
            float(row["team_utilization"]),
            int(row["days_remaining"]),
        )
        results.append(
            {
                "project_id": int(row["project_id"]),
                "project_name": row.get("name") if pd.notna(row.get("name")) else None,
                "status": pred["status"],
                "risk_level": pred["risk_level"],
                "delay_probability": int(pred["delay_probability"]),
            }
        )

    results.sort(key=lambda x: x["delay_probability"], reverse=True)
    return results


def get_at_risk_projects(delay_risk_rows: list[dict], threshold: int = 70) -> list[dict]:
    return [row for row in delay_risk_rows if int(row["delay_probability"]) >= threshold]


def get_sprint_velocity_trends(sprints_path: Path, project_id: Optional[int] = None) -> list[dict]:
    sprints = load_csv(sprints_path)
    if project_id is not None:
        sprints = sprints[sprints["project_id"] == project_id]

    sprints = sprints.sort_values(["project_id", "start_date"]).copy()

    rows: list[dict] = []
    for _, row in sprints.iterrows():
        rows.append(
            {
                "project_id": int(row["project_id"]),
                "sprint_name": str(row["sprint_name"]),
                "start_date": str(row["start_date"]),
                "end_date": str(row["end_date"]),
                "velocity": float(row["velocity"]),
            }
        )

    return rows


def get_developer_utilization_heatmap(util_path: Path, project_id: Optional[int] = None) -> list[dict]:
    util = load_csv(util_path)
    if project_id is not None:
        util = util[util["project_id"] == project_id]

    util = util.sort_values(["developer_name", "sprint_name"]).copy()

    rows: list[dict] = []
    for _, row in util.iterrows():
        rows.append(
            {
                "project_id": int(row["project_id"]),
                "developer_id": int(row["developer_id"]),
                "developer_name": str(row["developer_name"]),
                "sprint_name": str(row["sprint_name"]),
                "utilization_pct": float(row["utilization_pct"]),
            }
        )

    return rows

@analytics_router.post("/process")
async def process_csv_etl(file: UploadFile = File(...)):
    """Receives CSV from Spring Boot and triggers Pandas ETL pipeline"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Read file into memory
    content = await file.read()
    
    # Send raw bytes to analytics processor
    result = run_etl_pipeline(content, file.filename)
    
    if result.get("status") == "Failed":
        raise HTTPException(status_code=500, detail=result.get("error"))
        
    return result

def run_etl_pipeline(file_content: bytes, filename: str) -> dict:
    try:
        # 1. EXTRACT: Load raw bytes into a Pandas DataFrame
        df = pd.read_csv(io.BytesIO(file_content))
        
        # 2. TRANSFORM: Clean the data
        # Drop rows where all elements are missing
        df.dropna(how='all', inplace=True)
        
        # Fill missing numerical values with 0 (e.g., missing velocity)
        num_cols = df.select_dtypes(include=['number']).columns
        df[num_cols] = df[num_cols].fillna(0)
        
        # Fill missing text values
        text_cols = df.select_dtypes(include=['object']).columns
        df[text_cols] = df[text_cols].fillna("Unknown")
        
        # 3. ANALYTICS COMPUTATION
        total_records = len(df)
        
        # Generate some basic summary metrics based on the data
        # (This adapts to whatever CSV the admin uploads)
        summary_stats = df[num_cols].mean().to_dict() if len(num_cols) > 0 else {}
        
        # 4. LOAD: (Optional for MVP)
        # In a full system, you would push this cleaned DataFrame back to PostgreSQL or S3 here using:
        # df.to_sql('analytics_table', engine, if_exists='append')

        return {
            "status": "Success",
            "filename": filename,
            "records_processed": total_records,
            "analytics_summary": summary_stats,
            "message": "ETL pipeline executed successfully."
        }
        
    except Exception as e:
        return {
            "status": "Failed",
            "error": f"Pandas ETL Error: {str(e)}"
        }