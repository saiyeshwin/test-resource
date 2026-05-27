package com.seveneleven.platform.dto;

import com.seveneleven.platform.entity.Feedback;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class FeedbackDtos {
	private FeedbackDtos() {
	}

	public record CreateRequest(
			@NotNull Long managerId,
			@NotNull Long developerId,
			@NotBlank String comments) {
	}

	public record Response(
			Long feedbackId,
			Long managerId,
			String managerName,
			Long developerId,
			String developerName,
			String comments) {
		public static Response from(Feedback f) {
			return new Response(
					f.getFeedbackId(),
					f.getManager().getId(),
					f.getManager().getName(),
					f.getDeveloper().getId(),
					f.getDeveloper().getName(),
					f.getComments());
		}
	}
}
