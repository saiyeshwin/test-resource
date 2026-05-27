package com.seveneleven.platform.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.seveneleven.platform.entity.Role;
import com.seveneleven.platform.entity.User;
import com.seveneleven.platform.repository.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public List<User> list() {
		return userRepository.findAll();
	}

	public User get(Long id) {
		return userRepository.findById(id).orElseThrow();
	}

	public User create(String name, String email, String rawPassword, Role role) {
		if (userRepository.existsByEmail(email)) {
			throw new IllegalArgumentException("Email already registered");
		}
		User u = new User();
		u.setName(name);
		u.setEmail(email);
		u.setPassword(passwordEncoder.encode(rawPassword));
		u.setRole(role == null ? Role.DEVELOPER : role);
		return userRepository.save(u);
	}
}
