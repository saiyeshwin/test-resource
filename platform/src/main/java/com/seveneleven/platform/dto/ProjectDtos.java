package com.seveneleven.platform.dto;

import java.time.LocalDate;

import com.seveneleven.platform.entity.Project;
import com.seveneleven.platform.entity.ProjectStatus;

import jakarta.validation.constraints.NotBlank;

public final class ProjectDtos {
	private ProjectDtos() {
	}

	public record CreateRequest(
			@NotBlank String name,
			Long managerId,
			LocalDate startDate,
			LocalDate endDate,
			ProjectStatus status) {
	}

	public record UpdateRequest(
			String name,
			Long managerId,
			LocalDate startDate,
			LocalDate endDate,
			ProjectStatus status,
			Integer delayRiskScore) {
	}

	public record Response(
			Long projectId,
			String name,
			Long managerId,
			String managerName,
			LocalDate startDate,
			LocalDate endDate,
			ProjectStatus status,
			Integer delayRiskScore) {
		public static Response from(Project p) {
			Long managerId = p.getManager() != null ? p.getManager().getId() : null;
			String managerName = p.getManager() != null ? p.getManager().getName() : null;
			return new Response(
					p.getProjectId(),
					p.getName(),
					managerId,
					managerName,
					p.getStartDate(),
					p.getEndDate(),
					p.getStatus(),
					p.getDelayRiskScore());
		}
	}
}
