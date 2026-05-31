package com.seveneleven.platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.dto.ProjectDtos;
import com.seveneleven.platform.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

	private final ProjectService projectService;

	public ProjectController(ProjectService projectService) {
		this.projectService = projectService;
	}

	@GetMapping
	public List<ProjectDtos.Response> list() {
		return projectService.list().stream().map(ProjectDtos.Response::from).toList();
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<ProjectDtos.Response> create(@Valid @RequestBody ProjectDtos.CreateRequest request) {
		return ResponseEntity.ok(ProjectDtos.Response.from(projectService.create(request)));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<ProjectDtos.Response> update(@PathVariable Long id, @RequestBody ProjectDtos.UpdateRequest request) {
		return ResponseEntity.ok(ProjectDtos.Response.from(projectService.update(id, request)));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> delete(@PathVariable Long id) {
		projectService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
