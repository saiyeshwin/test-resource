package com.seveneleven.platform.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("NOT_FOUND", ex.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("BAD_REQUEST", ex.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<?> handleIllegalState(IllegalStateException ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error("INTERNAL_ERROR", ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> fields = new HashMap<>();
		for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
			fields.put(fe.getField(), fe.getDefaultMessage());
		}

		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now().toString());
		body.put("code", "VALIDATION_ERROR");
		body.put("message", "Validation failed");
		body.put("fields", fields);
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleOther(Exception ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(error("INTERNAL_ERROR", "Unexpected error"));
	}

	private Map<String, Object> error(String code, String message) {
		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now().toString());
		body.put("code", code);
		body.put("message", message);
		return body;
	}
}
