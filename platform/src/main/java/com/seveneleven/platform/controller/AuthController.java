package com.seveneleven.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.seveneleven.platform.entity.Role;
import com.seveneleven.platform.entity.User;
import com.seveneleven.platform.repository.UserRepository;
import com.seveneleven.platform.security.JwtService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthController(UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager,
			JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	public record RegisterRequest(
			@NotBlank String name,
			@Email @NotBlank String email,
			@NotBlank String password,
			Role role) {
	}

	public record LoginRequest(
			@Email @NotBlank String email,
			@NotBlank String password) {
	}

	public record AuthResponse(String token) {
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			return ResponseEntity.badRequest().body("Email already registered");
		}

		User user = new User();
		user.setName(request.name());
		user.setEmail(request.email());
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setRole(request.role() == null ? Role.DEVELOPER : request.role());
		userRepository.save(user);

		String token = jwtService.generateToken(
				new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(),
						java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))));
		return ResponseEntity.ok(new AuthResponse(token));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		Authentication auth = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.email(), request.password()));
		String token = jwtService.generateToken((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal());
		return ResponseEntity.ok(new AuthResponse(token));
	}
}
