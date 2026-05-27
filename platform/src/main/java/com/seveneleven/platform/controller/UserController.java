package com.seveneleven.platform.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.entity.User;
import com.seveneleven.platform.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<User> list() {
		return userService.list();
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public User get(@PathVariable Long id) {
		return userService.get(id);
	}
}
