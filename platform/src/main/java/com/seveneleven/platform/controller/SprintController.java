package com.seveneleven.platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.dto.SprintDtos;
import com.seveneleven.platform.service.SprintService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

	private final SprintService sprintService;

	public SprintController(SprintService sprintService) {
		this.sprintService = sprintService;
	}

	@GetMapping
	public List<SprintDtos.Response> list(@RequestParam(required = false) Long projectId) {
		return sprintService.list(projectId).stream().map(SprintDtos.Response::from).toList();
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<SprintDtos.Response> create(@Valid @RequestBody SprintDtos.CreateRequest request) {
		return ResponseEntity.ok(SprintDtos.Response.from(sprintService.create(request)));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<SprintDtos.Response> update(@PathVariable Long id, @RequestBody SprintDtos.UpdateRequest request) {
		return ResponseEntity.ok(SprintDtos.Response.from(sprintService.update(id, request)));
	}
}
