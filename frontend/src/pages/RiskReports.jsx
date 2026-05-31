import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

function getRiskStyle(prob, status) {
  const s = (status || "").toUpperCase();
  if (s === "HIGH" || prob >= 70)
    return {
      color: "var(--danger)",
      bg: "var(--danger-bg)",
      border: "var(--danger)",
      label: "High Risk",
    };
  if (s === "MEDIUM" || prob >= 40)
    return {
      color: "var(--warning)",
      bg: "var(--warning-bg)",
      border: "var(--warning)",
      label: "Medium Risk",
    };
  return {
    color: "var(--success)",
    bg: "var(--success-bg)",
    border: "var(--success)",
    label: "Low Risk",
  };
}

export default function RiskReports() {
  const [projects, setProjects] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setMessage("");
    try {
      const projectData = await api.get("/projects");
      setProjects(projectData);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (projectId) => {
    try {
      const prediction = await api.post(`/predict/${projectId}`, {});
      setPredictions((prev) => ({ ...prev, [projectId]: prediction }));
      // Update the local project score in state so the progress bar updates instantly
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === projectId
            ? { ...p, delayRiskScore: prediction.delayProbability }
            : p
        )
      );
    } catch (err) {
      setPredictions((prev) => ({
        ...prev,
        [projectId]: {
          riskStatus: "UNKNOWN",
          delayProbability: 0,
          recommendation: err.message,
        },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3
            className="text-3xl font-semibold"
            style={{ color: "var(--text)" }}
          >
            Delay Risk Reports
          </h3>
          <p className="mt-1" style={{ color: "var(--muted)" }}>
            AI-driven predictions for project delivery risk and recommended
            follow-ups.
          </p>
        </div>
      </div>

      {message && (
        <Card
          style={{
            background: "var(--surface-strong)",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ color: "var(--text)" }}>{message}</p>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl animate-pulse"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const prediction = predictions[project.projectId];
            // Use fresh predicted score if available, otherwise fallback to project's saved score
            const hasData =
              prediction !== undefined || project.delayRiskScore != null;
            const prob = prediction
              ? prediction.delayProbability
              : project.delayRiskScore ?? 0;
            const status = prediction
              ? prediction.riskStatus
              : prob >= 70
              ? "HIGH"
              : prob >= 40
              ? "MEDIUM"
              : "LOW";
            const recommendation = prediction
              ? prediction.recommendation
              : "Review sprint plan and rebalance workload if needed";
            const rs = getRiskStyle(prob, status);
            return (
              <div
                key={project.projectId}
                className="card-surface rounded-3xl p-5 shadow-xl overflow-hidden relative"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${rs.border}`,
                  boxShadow: "0 15px 40px var(--shadow)",
                }}
              >
                {/* Subtle risk tint overlay */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{ background: rs.bg, opacity: 0.04 }}
                />

                <div className="flex items-start justify-between gap-4 relative">
                  <div>
                    <p
                      className="font-semibold text-base"
                      style={{ color: "var(--text-h)" }}
                    >
                      {project.name}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      Manager: {project.managerName || "Unassigned"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="text-3xl font-bold tabular-nums"
                      style={{ color: rs.color }}
                    >
                      {hasData ? `${prob}%` : "–"}
                    </p>
                    <span
                      className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                      style={{ background: rs.bg, color: rs.color }}
                    >
                      {hasData ? rs.label : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 relative">
                  {/* Probability progress bar */}
                  <div
                    className="rounded-full h-1.5 overflow-hidden mb-3"
                    style={{ background: "var(--surface-strong)" }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${prob}%`, background: rs.color }}
                    />
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    {hasData ? recommendation : "No recommendation available yet."}
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 rounded-2xl px-4 py-2 text-xs font-semibold transition relative"
                  style={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                  onClick={() => fetchPrediction(project.projectId)}
                >
                  Refresh prediction
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
