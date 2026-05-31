package com.seveneleven.platform.dto;

import java.time.LocalDate;

import com.seveneleven.platform.entity.Sprint;
import com.seveneleven.platform.entity.SprintStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class SprintDtos {
	private SprintDtos() {
	}

	public record CreateRequest(
			@NotNull Long projectId,
			@NotBlank String sprintName,
			Integer velocity,
			LocalDate startDate,
			LocalDate endDate,
			SprintStatus status) {
	}

	public record UpdateRequest(
			String sprintName,
			Integer velocity,
			LocalDate startDate,
			LocalDate endDate,
			SprintStatus status) {
	}

	public record Response(
			Long sprintId,
			Long projectId,
			String sprintName,
			Integer velocity,
			LocalDate startDate,
			LocalDate endDate,
			SprintStatus status) {
		public static Response from(Sprint s) {
			return new Response(
					s.getSprintId(),
					s.getProject().getProjectId(),
					s.getSprintName(),
					s.getVelocity(),
					s.getStartDate(),
					s.getEndDate(),
					s.getStatus());
		}
	}
}
