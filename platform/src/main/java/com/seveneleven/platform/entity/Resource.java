package com.seveneleven.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "resource_id")
	private Long resourceId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "utilization_pct")
	private Integer utilizationPct;

	private String availability;

	@Column(columnDefinition = "text")
	private String feedback;

	public Long getResourceId() {
		return resourceId;
	}

	public void setResourceId(Long resourceId) {
		this.resourceId = resourceId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public Integer getUtilizationPct() {
		return utilizationPct;
	}

	public void setUtilizationPct(Integer utilizationPct) {
		this.utilizationPct = utilizationPct;
	}

	public String getAvailability() {
		return availability;
	}

	public void setAvailability(String availability) {
		this.availability = availability;
	}

	public String getFeedback() {
		return feedback;
	}

	public void setFeedback(String feedback) {
		this.feedback = feedback;
	}
}
