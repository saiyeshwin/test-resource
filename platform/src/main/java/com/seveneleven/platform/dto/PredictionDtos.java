package com.seveneleven.platform.dto;

import com.seveneleven.platform.entity.Prediction;

public final class PredictionDtos {
	private PredictionDtos() {
	}

	// matches Python service schema from the document
	public record MlRequest(Integer sprint_velocity, Integer task_completion_rate, Integer team_utilization,
			Integer days_remaining) {
	}

	public record MlResponse(Integer delay_probability, String status) {
	}

	public record Response(Long predictionId, Long projectId, Integer delayProbability, String riskStatus,
			String recommendation) {
		public static Response from(Prediction p) {
			return new Response(
					p.getPredictionId(),
					p.getProject().getProjectId(),
					p.getDelayProbability(),
					p.getRiskStatus(),
					p.getRecommendation());
		}
	}
}
