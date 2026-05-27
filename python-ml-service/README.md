# Python FastAPI Analytics & Intelligence Service

Day 1 deliverable: FastAPI service with a dummy delay risk prediction endpoint.
Day 2 deliverable: ML delay risk prediction using a dummy CSV dataset.

## Run locally

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## ML mode (Logistic Regression or Random Forest)

This service supports two prediction modes:

- RULE_BASED (default)
- ML (Logistic Regression or Random Forest)

### Dataset

This repo already includes a dummy dataset at:

- data/sprint_velocity.csv

### Train + start in ML mode

If you want to use a `.env` file, this repo includes one at the service root. Run uvicorn with `--env-file .env` so the variables are loaded.

PowerShell:

```powershell
$env:PREDICTION_MODE = "ML"
$env:ML_MODEL = "logreg"  # or "rf"
uvicorn app.main:app --reload --port 8001
```

With .env:

```powershell
uvicorn app.main:app --reload --port 8001 --env-file .env
```

CMD:

```bat
set PREDICTION_MODE=ML
set ML_MODEL=logreg
uvicorn app.main:app --reload --port 8001
```

With .env:

```bat
uvicorn app.main:app --reload --port 8001 --env-file .env
```

Training happens automatically on startup when ML mode is enabled.

## Endpoints

- GET /health
- GET /model
- POST /predict

## Day 4 Analytics APIs (for Recharts)

These endpoints return ready-to-chart JSON.

- GET /analytics/delay-risk-per-project
  - Use for: "Delay risk % per project" (bar chart)
- GET /analytics/at-risk-projects?threshold=70
  - Use for: "At-risk projects list" (table)
- GET /analytics/sprint-velocity?project_id=101
  - Use for: "Sprint velocity trends" (line chart)
- GET /analytics/developer-utilization?project_id=101
  - Use for: "Developer utilization heatmap" (matrix-style chart)

### PowerShell examples

```powershell
Invoke-RestMethod http://127.0.0.1:8001/analytics/delay-risk-per-project
Invoke-RestMethod "http://127.0.0.1:8001/analytics/at-risk-projects?threshold=70"
Invoke-RestMethod "http://127.0.0.1:8001/analytics/sprint-velocity?project_id=101"
Invoke-RestMethod "http://127.0.0.1:8001/analytics/developer-utilization?project_id=101"
```

### Example request

```json
{
  "sprint_velocity": 42,
  "task_completion_rate": 68,
  "team_utilization": 91,
  "days_remaining": 5
}
```

### Example response

```json
{
  "delay_probability": 55,
  "status": "Moderate Risk",
  "risk_level": "MODERATE"
}
```
