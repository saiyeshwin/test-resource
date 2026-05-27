package com.seveneleven.platform.dto;

import com.seveneleven.platform.entity.Resource;

import jakarta.validation.constraints.NotNull;

public final class ResourceDtos {
	private ResourceDtos() {
	}

	public record CreateRequest(
			@NotNull Long userId,
			@NotNull Long projectId,
			Integer utilizationPct,
			String availability,
			String feedback) {
	}

	public record UpdateRequest(
			Long userId,
			Long projectId,
			Integer utilizationPct,
			String availability,
			String feedback) {
	}

	public record Response(
			Long resourceId,
			Long userId,
			String userName,
			Long projectId,
			String projectName,
			Integer utilizationPct,
			String availability,
			String feedback) {
		public static Response from(Resource r) {
			return new Response(
					r.getResourceId(),
					r.getUser().getId(),
					r.getUser().getName(),
					r.getProject().getProjectId(),
					r.getProject().getName(),
					r.getUtilizationPct(),
					r.getAvailability(),
					r.getFeedback());
		}
	}
}
