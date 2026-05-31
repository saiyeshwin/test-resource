package com.seveneleven.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "predictions")
public class Prediction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "prediction_id")
	private Long predictionId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "delay_probability")
	private Integer delayProbability;

	@Column(name = "risk_status")
	private String riskStatus;

	@Column(name = "recommendation")
	private String recommendation;

	public Long getPredictionId() {
		return predictionId;
	}

	public void setPredictionId(Long predictionId) {
		this.predictionId = predictionId;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public Integer getDelayProbability() {
		return delayProbability;
	}

	public void setDelayProbability(Integer delayProbability) {
		this.delayProbability = delayProbability;
	}

	public String getRiskStatus() {
		return riskStatus;
	}

	public void setRiskStatus(String riskStatus) {
		this.riskStatus = riskStatus;
	}

	public String getRecommendation() {
		return recommendation;
	}

	public void setRecommendation(String recommendation) {
		this.recommendation = recommendation;
	}
}
