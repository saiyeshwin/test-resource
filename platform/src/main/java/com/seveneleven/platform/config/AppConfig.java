package com.seveneleven.platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
public class AppConfig {

	@Bean
    public RestClient restClient() {
        // Force standard HTTP/1.1 connections so Node.js (Express) doesn't drop the TCP socket
        return RestClient.builder()
                .requestFactory(new SimpleClientHttpRequestFactory())
                .build();
    }
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}