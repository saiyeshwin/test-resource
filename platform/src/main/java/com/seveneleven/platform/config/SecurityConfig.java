package com.seveneleven.platform.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.seveneleven.platform.security.CustomUserDetailsService;
import com.seveneleven.platform.security.JwtAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationManager authenticationManager) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationManager(authenticationManager)

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/uploads/upload-csv",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // User APIs
                        .requestMatchers("/api/users/**")
                        .hasRole("ADMIN")

                        // Upload APIs
                        .requestMatchers("/api/uploads/users")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/uploads/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Project APIs
                        .requestMatchers(HttpMethod.GET, "/api/projects/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/projects/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.PUT, "/api/projects/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.DELETE, "/api/projects/**")
                        .hasRole("ADMIN")

                        // Sprint APIs
                        .requestMatchers(HttpMethod.GET, "/api/sprints/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/sprints/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.PUT, "/api/sprints/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Task APIs
                        .requestMatchers(HttpMethod.GET, "/api/tasks/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/tasks/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.PUT, "/api/tasks/**")
                        .hasAnyRole("ADMIN", "MANAGER", "DEVELOPER")

                        .requestMatchers(HttpMethod.DELETE, "/api/tasks/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Resource APIs
                        .requestMatchers(HttpMethod.GET, "/api/resources/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/resources/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.PUT, "/api/resources/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Feedback APIs
                        .requestMatchers(HttpMethod.GET, "/api/feedback/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/feedback/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Prediction APIs
                        .requestMatchers("/api/predict/**")
                        .authenticated()

                        // Any other request
                        .anyRequest()
                        .authenticated())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(provider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(
        List.of("*"));
        configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(
            List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source =new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
}
}