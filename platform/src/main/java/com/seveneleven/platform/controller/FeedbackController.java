package com.seveneleven.platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.dto.FeedbackDtos;
import com.seveneleven.platform.service.FeedbackService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

	private final FeedbackService feedbackService;

	public FeedbackController(FeedbackService feedbackService) {
		this.feedbackService = feedbackService;
	}

	@GetMapping
	public List<FeedbackDtos.Response> list(@RequestParam(required = false) Long developerId) {
		return feedbackService.list(developerId).stream().map(FeedbackDtos.Response::from).toList();
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<FeedbackDtos.Response> create(@Valid @RequestBody FeedbackDtos.CreateRequest request) {
		return ResponseEntity.ok(FeedbackDtos.Response.from(feedbackService.create(request)));
	}
}
