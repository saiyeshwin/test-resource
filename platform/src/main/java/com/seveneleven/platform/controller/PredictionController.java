package com.seveneleven.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.dto.PredictionDtos;
import com.seveneleven.platform.service.PredictionService;

@RestController
@RequestMapping("/api/predict")
public class PredictionController {

	private final PredictionService predictionService;

	public PredictionController(PredictionService predictionService) {
		this.predictionService = predictionService;
	}

	@PostMapping("/{projectId}")
	public ResponseEntity<PredictionDtos.Response> predict(@PathVariable Long projectId,
			@RequestBody(required = false) PredictionDtos.MlRequest request) {
		return ResponseEntity.ok(PredictionDtos.Response.from(predictionService.predict(projectId, request)));
	}
}
