package com.seveneleven.platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.dto.TaskDtos;
import com.seveneleven.platform.service.TaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

	private final TaskService taskService;

	public TaskController(TaskService taskService) {
		this.taskService = taskService;
	}

	@GetMapping
	public List<TaskDtos.Response> list(@RequestParam(required = false) Long sprintId,
			@RequestParam(required = false) Long assigneeId) {
		return taskService.list(sprintId, assigneeId).stream().map(TaskDtos.Response::from).toList();
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<TaskDtos.Response> create(@Valid @RequestBody TaskDtos.CreateRequest request) {
		return ResponseEntity.ok(TaskDtos.Response.from(taskService.create(request)));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('DEVELOPER')")
	public ResponseEntity<TaskDtos.Response> update(@PathVariable Long id, @RequestBody TaskDtos.UpdateRequest request) {
		return ResponseEntity.ok(TaskDtos.Response.from(taskService.update(id, request)));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<?> delete(@PathVariable Long id) {
		taskService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
