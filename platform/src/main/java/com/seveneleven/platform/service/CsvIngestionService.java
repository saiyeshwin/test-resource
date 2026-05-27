package com.seveneleven.platform.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.seveneleven.platform.dto.UploadDtos;
import com.seveneleven.platform.entity.Project;
import com.seveneleven.platform.entity.ProjectStatus;
import com.seveneleven.platform.entity.Resource;
import com.seveneleven.platform.entity.Role;
import com.seveneleven.platform.entity.Sprint;
import com.seveneleven.platform.entity.Task;
import com.seveneleven.platform.entity.TaskPriority;
import com.seveneleven.platform.entity.TaskStatus;
import com.seveneleven.platform.entity.User;
import com.seveneleven.platform.repository.ProjectRepository;
import com.seveneleven.platform.repository.ResourceRepository;
import com.seveneleven.platform.repository.SprintRepository;
import com.seveneleven.platform.repository.TaskRepository;
import com.seveneleven.platform.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CsvIngestionService {

	private final UserRepository userRepository;
	private final ProjectRepository projectRepository;
	private final SprintRepository sprintRepository;
	private final TaskRepository taskRepository;
	private final ResourceRepository resourceRepository;
	private final PasswordEncoder passwordEncoder;
	private final RestTemplate restTemplate;

	@Value("${python.etl.service.url}")
	private String pythonEtlUrl;
	private static final org.slf4j.Logger log =
		    org.slf4j.LoggerFactory.getLogger(CsvIngestionService.class);
	public CsvIngestionService(UserRepository userRepository,
			ProjectRepository projectRepository,
			SprintRepository sprintRepository,
			TaskRepository taskRepository,
			ResourceRepository resourceRepository,
			PasswordEncoder passwordEncoder,
			RestTemplate restTemplate) {
		this.userRepository = userRepository;
		this.projectRepository = projectRepository;
		this.sprintRepository = sprintRepository;
		this.taskRepository = taskRepository;
		this.resourceRepository = resourceRepository;
		this.passwordEncoder = passwordEncoder;
		this.restTemplate = restTemplate;
	}

	public UploadDtos.UploadResult uploadUsers(MultipartFile file) {
		List<String> errors = new ArrayList<>();
		int processed = 0;
		int inserted = 0;
		int updated = 0;
		for (CSVRecord r : parse(file)) {
			processed++;
			try {
				String email = req(r, "email");
				String name = req(r, "name");
				String rawPassword = opt(r, "password");
				Role role = parseEnum(opt(r, "role"), Role.class, Role.DEVELOPER);

				User u = userRepository.findByEmail(email).orElse(null);
				if (u == null) {
					u = new User();
					u.setEmail(email);
					u.setName(name);
					u.setRole(role);
					u.setPassword(passwordEncoder.encode(rawPassword == null || rawPassword.isBlank() ? "Password@123" : rawPassword));
					userRepository.save(u);
					inserted++;
				} else {
					u.setName(name);
					u.setRole(role);
					if (rawPassword != null && !rawPassword.isBlank()) {
						u.setPassword(passwordEncoder.encode(rawPassword));
					}
					userRepository.save(u);
					updated++;
				}
			} catch (Exception ex) {
				errors.add("row " + processed + ": " + ex.getMessage());
			}
		}
		return new UploadDtos.UploadResult(processed, inserted, updated, errors);
	}

	public UploadDtos.UploadResult uploadProjects(MultipartFile file) {
		List<String> errors = new ArrayList<>();
		int processed = 0;
		int inserted = 0;
		int updated = 0;
		for (CSVRecord r : parse(file)) {
			processed++;
			try {
				String name = req(r, "name");
				Long projectId = parseLong(opt(r, "project_id"));
				Long managerId = parseLong(opt(r, "manager_id"));
				ProjectStatus status = parseEnum(opt(r, "status"), ProjectStatus.class, ProjectStatus.PLANNED);
				Integer delayRiskScore = parseInt(opt(r, "delay_risk_score"));

				Project p = (projectId != null) ? projectRepository.findById(projectId).orElse(null) : null;
				if (p == null) {
					p = new Project();
					inserted++;
				} else {
					updated++;
				}
				p.setName(name);
				p.setStatus(status);
				p.setDelayRiskScore(delayRiskScore);
				if (managerId != null) {
					p.setManager(userRepository.findById(managerId)
							.orElseThrow(() -> new IllegalArgumentException("Manager not found: id=" + managerId)));
				}
				projectRepository.save(p);
			} catch (Exception ex) {
				errors.add("row " + processed + ": " + ex.getMessage());
			}
		}
		return new UploadDtos.UploadResult(processed, inserted, updated, errors);
	}

	public UploadDtos.UploadResult uploadTasks(MultipartFile file) {
		List<String> errors = new ArrayList<>();
		int processed = 0;
		int inserted = 0;
		int updated = 0;
		for (CSVRecord r : parse(file)) {
			processed++;
			try {
				Long taskId = parseLong(opt(r, "task_id"));
				Long sprintId = parseLong(req(r, "sprint_id"));
				Long assigneeId = parseLong(opt(r, "assignee_id"));
				String title = req(r, "title");
				TaskPriority priority = parseEnum(opt(r, "priority"), TaskPriority.class, TaskPriority.MEDIUM);
				TaskStatus status = parseEnum(opt(r, "status"), TaskStatus.class, TaskStatus.TO_DO);
				Integer storyPoints = parseInt(opt(r, "story_points"));

				Task t = (taskId != null) ? taskRepository.findById(taskId).orElse(null) : null;
				if (t == null) {
					t = new Task();
					inserted++;
				} else {
					updated++;
				}

				Sprint sprint = sprintRepository.findById(sprintId)
					.orElseThrow(() -> new IllegalArgumentException("Sprint not found: id=" + sprintId));
				t.setSprint(sprint);
				t.setTitle(title);
				t.setPriority(priority);
				t.setStatus(status);
				t.setStoryPoints(storyPoints);
				if (assigneeId != null) {
					t.setAssignee(userRepository.findById(assigneeId)
							.orElseThrow(() -> new IllegalArgumentException("Assignee not found: id=" + assigneeId)));
				}
				taskRepository.save(t);
			} catch (Exception ex) {
				errors.add("row " + processed + ": " + ex.getMessage());
			}
		}
		return new UploadDtos.UploadResult(processed, inserted, updated, errors);
	}

	public UploadDtos.UploadResult uploadResources(MultipartFile file) {
		List<String> errors = new ArrayList<>();
		int processed = 0;
		int inserted = 0;
		int updated = 0;
		for (CSVRecord r : parse(file)) {
			processed++;
			try {
				Long resourceId = parseLong(opt(r, "resource_id"));
				Long userId = parseLong(req(r, "user_id"));
				Long projectId = parseLong(req(r, "project_id"));
				Integer utilizationPct = parseInt(opt(r, "utilization_pct"));
				String availability = opt(r, "availability");
				String feedback = opt(r, "feedback");

				Resource res = (resourceId != null) ? resourceRepository.findById(resourceId).orElse(null) : null;
				if (res == null) {
					res = new Resource();
					inserted++;
				} else {
					updated++;
				}
				res.setUser(userRepository.findById(userId)
					.orElseThrow(() -> new IllegalArgumentException("User not found: id=" + userId)));
				res.setProject(projectRepository.findById(projectId)
					.orElseThrow(() -> new IllegalArgumentException("Project not found: id=" + projectId)));
				res.setUtilizationPct(utilizationPct);
				res.setAvailability(availability);
				res.setFeedback(feedback);
				resourceRepository.save(res);
			} catch (Exception ex) {
				errors.add("row " + processed + ": " + ex.getMessage());
			}
		}
		return new UploadDtos.UploadResult(processed, inserted, updated, errors);
	}

	private List<CSVRecord> parse(MultipartFile file) {
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
				CSVParser parser = CSVFormat.DEFAULT
						.builder()
						.setHeader()
						.setSkipHeaderRecord(true)
						.setIgnoreHeaderCase(true)
						.setTrim(true)
						.build()
						.parse(reader)) {

			if (parser.getHeaderMap() == null || parser.getHeaderMap().isEmpty()) {
				throw new IllegalArgumentException("CSV missing header row");
			}
			return parser.getRecords();
		} catch (Exception ex) {
			throw new IllegalArgumentException("Invalid CSV file: " + ex.getMessage(), ex);
		}
	}

	private String req(CSVRecord r, String header) {
		String v = opt(r, header);
		if (v == null || v.isBlank()) {
			throw new IllegalArgumentException("Missing required column: " + header);
		}
		return v;
	}

	private String opt(CSVRecord r, String header) {
		try {
			if (!r.isMapped(header)) {
				return null;
			}
			String v = r.get(header);
			return v != null ? v.trim() : null;
		} catch (Exception ex) {
			return null;
		}
	}

	private Long parseLong(String v) {
		if (v == null || v.isBlank()) {
			return null;
		}
		try {
			return Long.parseLong(v.trim());
		} catch (NumberFormatException nfe) {
			throw new IllegalArgumentException("Invalid number: '" + v + "'", nfe);
		}
	}

	private Integer parseInt(String v) {
		if (v == null || v.isBlank()) {
			return null;
		}
		try {
			return Integer.parseInt(v.trim());
		} catch (NumberFormatException nfe) {
			throw new IllegalArgumentException("Invalid number: '" + v + "'", nfe);
		}
	}

	private <T extends Enum<T>> T parseEnum(String v, Class<T> enumClass, T defaultValue) {
		if (v == null || v.isBlank()) {
			return defaultValue;
		}
		String normalized = v.trim().toUpperCase(Locale.ROOT);
		normalized = normalized.replace(' ', '_');
		normalized = normalized.replace('-', '_');
		return Enum.valueOf(enumClass, normalized);
	}

	public String processCsvData(MultipartFile file) {
		log.info("Forwarding CSV file '{}' to Python ETL Service", file.getOriginalFilename());

		try {
			// 1. Set up Multipart Headers
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			// 2. Attach the file to the body
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", file.getResource());

			// 3. Create the HTTP request
			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			// 4. Send POST request to FastAPI
			ResponseEntity<String> response = restTemplate.postForEntity(
					pythonEtlUrl, 
					requestEntity, 
					String.class
			);

			log.info("ETL Pipeline completed successfully.");
			return response.getBody();

		} catch (Exception e) {
			//log.error("Failed to process CSV via Python ETL", e);
			throw new RuntimeException("ETL Processing failed: " + e.getMessage());
		}
	}
}