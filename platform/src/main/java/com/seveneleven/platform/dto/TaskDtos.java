package com.seveneleven.platform.dto;

import com.seveneleven.platform.entity.Task;
import com.seveneleven.platform.entity.TaskPriority;
import com.seveneleven.platform.entity.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class TaskDtos {
	private TaskDtos() {
	}

	public record CreateRequest(
			@NotNull Long sprintId,
			Long assigneeId,
			@NotBlank String title,
			TaskPriority priority,
			TaskStatus status,
			Integer storyPoints) {
	}

	public record UpdateRequest(
			Long sprintId,
			Long assigneeId,
			String title,
			TaskPriority priority,
			TaskStatus status,
			Integer storyPoints) {
	}

	public record Response(
			Long taskId,
			Long sprintId,
			Long assigneeId,
			String assigneeName,
			String title,
			TaskPriority priority,
			TaskStatus status,
			Integer storyPoints) {
		public static Response from(Task t) {
			Long assigneeId = t.getAssignee() != null ? t.getAssignee().getId() : null;
			String assigneeName = t.getAssignee() != null ? t.getAssignee().getName() : null;
			return new Response(
					t.getTaskId(),
					t.getSprint().getSprintId(),
					assigneeId,
					assigneeName,
					t.getTitle(),
					t.getPriority(),
					t.getStatus(),
					t.getStoryPoints());
		}
	}
}
