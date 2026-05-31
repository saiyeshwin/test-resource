package com.seveneleven.platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.dto.ResourceDtos;
import com.seveneleven.platform.service.ResourceService;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

	private final ResourceService resourceService;

	public ResourceController(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	@GetMapping
	public List<ResourceDtos.Response> list(@RequestParam(required = false) Long projectId,
			@RequestParam(required = false) Long userId) {
		return resourceService.list(projectId, userId).stream().map(ResourceDtos.Response::from).toList();
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<ResourceDtos.Response> create(@RequestBody ResourceDtos.CreateRequest request) {
		return ResponseEntity.ok(ResourceDtos.Response.from(resourceService.create(request)));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<ResourceDtos.Response> update(@PathVariable Long id, @RequestBody ResourceDtos.UpdateRequest request) {
		return ResponseEntity.ok(ResourceDtos.Response.from(resourceService.update(id, request)));
	}
}
