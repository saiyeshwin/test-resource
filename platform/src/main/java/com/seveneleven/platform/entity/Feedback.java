package com.seveneleven.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback")
public class Feedback {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "feedback_id")
	private Long feedbackId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "manager_id", nullable = false)
	private User manager;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "developer_id", nullable = false)
	private User developer;

	@Column(columnDefinition = "text", nullable = false)
	private String comments;

	public Long getFeedbackId() {
		return feedbackId;
	}

	public void setFeedbackId(Long feedbackId) {
		this.feedbackId = feedbackId;
	}

	public User getManager() {
		return manager;
	}

	public void setManager(User manager) {
		this.manager = manager;
	}

	public User getDeveloper() {
		return developer;
	}

	public void setDeveloper(User developer) {
		this.developer = developer;
	}

	public String getComments() {
		return comments;
	}

	public void setComments(String comments) {
		this.comments = comments;
	}
}
