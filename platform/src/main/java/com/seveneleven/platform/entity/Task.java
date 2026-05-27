package com.seveneleven.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tasks")
public class Task {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "task_id")
	private Long taskId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sprint_id", nullable = false)
	private Sprint sprint;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assignee_id")
	private User assignee;

	@Column(nullable = false)
	private String title;

	@Enumerated(EnumType.STRING)
	private TaskPriority priority = TaskPriority.MEDIUM;

	@Enumerated(EnumType.STRING)
	private TaskStatus status = TaskStatus.TO_DO;

	@Column(name = "story_points")
	private Integer storyPoints;

	public Long getTaskId() {
		return taskId;
	}

	public void setTaskId(Long taskId) {
		this.taskId = taskId;
	}

	public Sprint getSprint() {
		return sprint;
	}

	public void setSprint(Sprint sprint) {
		this.sprint = sprint;
	}

	public User getAssignee() {
		return assignee;
	}

	public void setAssignee(User assignee) {
		this.assignee = assignee;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public TaskPriority getPriority() {
		return priority;
	}

	public void setPriority(TaskPriority priority) {
		this.priority = priority;
	}

	public TaskStatus getStatus() {
		return status;
	}

	public void setStatus(TaskStatus status) {
		this.status = status;
	}

	public Integer getStoryPoints() {
		return storyPoints;
	}

	public void setStoryPoints(Integer storyPoints) {
		this.storyPoints = storyPoints;
	}
}
