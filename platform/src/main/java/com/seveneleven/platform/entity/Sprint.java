package com.seveneleven.platform.entity;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "sprints")
public class Sprint {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "sprint_id")
	private Long sprintId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "sprint_name", nullable = false)
	private String sprintName;

	private Integer velocity;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SprintStatus status = SprintStatus.PLANNED;

	public Long getSprintId() {
		return sprintId;
	}

	public void setSprintId(Long sprintId) {
		this.sprintId = sprintId;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public String getSprintName() {
		return sprintName;
	}

	public void setSprintName(String sprintName) {
		this.sprintName = sprintName;
	}

	public Integer getVelocity() {
		return velocity;
	}

	public void setVelocity(Integer velocity) {
		this.velocity = velocity;
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

	public SprintStatus getStatus() {
		return status;
	}

	public void setStatus(SprintStatus status) {
		this.status = status;
	}
}
