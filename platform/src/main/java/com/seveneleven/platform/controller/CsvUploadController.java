package com.seveneleven.platform.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.seveneleven.platform.dto.UploadDtos;
import com.seveneleven.platform.service.CsvIngestionService;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*") // Allows your React frontend to call these endpoints
public class CsvUploadController {

	private final CsvIngestionService csvIngestionService;

	public CsvUploadController(CsvIngestionService csvIngestionService) {
		this.csvIngestionService = csvIngestionService;
	}

	@PostMapping(value = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<UploadDtos.UploadResult> uploadUsers(@RequestPart("file") MultipartFile file) {
		return ResponseEntity.ok(csvIngestionService.uploadUsers(file));
	}

	@PostMapping(value = "/projects", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<UploadDtos.UploadResult> uploadProjects(@RequestPart("file") MultipartFile file) {
		return ResponseEntity.ok(csvIngestionService.uploadProjects(file));
	}

	@PostMapping(value = "/tasks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<UploadDtos.UploadResult> uploadTasks(@RequestPart("file") MultipartFile file) {
		return ResponseEntity.ok(csvIngestionService.uploadTasks(file));
	}

	@PostMapping(value = "/resources", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
	public ResponseEntity<UploadDtos.UploadResult> uploadResources(@RequestPart("file") MultipartFile file) {
		return ResponseEntity.ok(csvIngestionService.uploadResources(file));
	}

	// Triggers the Python Pandas ETL Pipeline
	@PostMapping(value = "/upload-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> uploadProjectData(@RequestParam("file") MultipartFile file) {
		if (file.isEmpty()) {
			// Fixed the string escaping syntax error here
			return ResponseEntity.badRequest().body("{\"error\": \"Please select a valid CSV file to upload.\"}");
		}
		
		String etlResult = csvIngestionService.processCsvData(file);
		return ResponseEntity.ok(etlResult);
	}
}