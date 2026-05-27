package com.seveneleven.platform.dto;

import java.util.List;

public final class UploadDtos {
	private UploadDtos() {
	}

	public record UploadResult(int processed, int inserted, int updated, List<String> errors) {
	}
}
