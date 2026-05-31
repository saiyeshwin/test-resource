package com.seveneleven.platform.entity;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "project_id")
	private Long projectId;

	@Column(nullable = false)
	private String name;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "manager_id")
	private User manager;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProjectStatus status = ProjectStatus.PLANNED;

	@Column(name = "delay_risk_score")
	private Integer delayRiskScore;

	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public User getManager() {
		return manager;
	}

	public void setManager(User manager) {
		this.manager = manager;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public ProjectStatus getStatus() {
		return status;
	}

	public void setStatus(ProjectStatus status) {
		this.status = status;
	}

	public Integer getDelayRiskScore() {
		return delayRiskScore;
	}

	public void setDelayRiskScore(Integer delayRiskScore) {
		this.delayRiskScore = delayRiskScore;
	}
}
