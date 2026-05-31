package com.seveneleven.platform.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.seveneleven.platform.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		var user = userRepository.findByEmail(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));

		var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
		return new org.springframework.security.core.userdetails.User(
				user.getEmail(),
				user.getPassword(),
				List.of(authority));
	}
}
