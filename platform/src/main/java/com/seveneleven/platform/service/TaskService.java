package com.seveneleven.platform.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.seveneleven.platform.dto.TaskDtos;
import com.seveneleven.platform.entity.Task;
import com.seveneleven.platform.repository.SprintRepository;
import com.seveneleven.platform.repository.TaskRepository;
import com.seveneleven.platform.repository.UserRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final RestClient restClient;
    private final String nodeBaseUrl;
    private final String nodeApiKey;

    public TaskService(TaskRepository taskRepository,
            SprintRepository sprintRepository,
            UserRepository userRepository,
            RestClient restClient,
            @Value("${app.node.base-url:http://localhost:5000}") String nodeBaseUrl,
            @Value("${app.node.api-key:capstone_secret_key_2026}") String nodeApiKey) {
        this.taskRepository = taskRepository;
        this.sprintRepository = sprintRepository;
        this.userRepository = userRepository;
        this.restClient = restClient;
        this.nodeBaseUrl = nodeBaseUrl;
        this.nodeApiKey = nodeApiKey;
    }

    public List<Task> list(Long sprintId, Long assigneeId) {
        if (sprintId != null) {
            return taskRepository.findBySprint_SprintId(sprintId);
        }
        if (assigneeId != null) {
            return taskRepository.findByAssignee_Id(assigneeId);
        }
        return taskRepository.findAll();
    }

    public Task get(Long id) {
        return taskRepository.findById(id).orElseThrow();
    }

    public Task create(TaskDtos.CreateRequest request) {
        Task t = new Task();
        t.setSprint(sprintRepository.findById(request.sprintId()).orElseThrow());

        if (request.assigneeId() != null) {
            t.setAssignee(userRepository.findById(request.assigneeId()).orElseThrow());
        }
        t.setTitle(request.title());

        if (request.priority() != null) {
            t.setPriority(request.priority());
        }
        if (request.status() != null) {
            t.setStatus(request.status());
        }
        t.setStoryPoints(request.storyPoints());

        Task savedTask = taskRepository.save(t);

        try {
            Map<String, Object> payload = Map.of(
                    "taskId", savedTask.getTaskId(),
                    "developerId", savedTask.getAssignee() != null ? savedTask.getAssignee().getId() : "Unassigned",
                    "title", savedTask.getTitle());

            restClient.post()
                    .uri(nodeBaseUrl + "/api/notify/task-assigned")
                    .header("x-api-key", nodeApiKey)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // Log error but don't fail the transaction if notification service is down
            System.err.println("Failed to send notification to Node service: " + e.getMessage());
        }

        return savedTask;
    }

    public Task update(Long id, TaskDtos.UpdateRequest request) {
        Task t = get(id);

        if (request.sprintId() != null) {
            t.setSprint(sprintRepository.findById(request.sprintId()).orElseThrow());
        }
        if (request.title() != null && !request.title().isBlank()) {
            t.setTitle(request.title());
        }
        if (request.assigneeId() != null) {
            t.setAssignee(userRepository.findById(request.assigneeId()).orElseThrow());
        }
        if (request.priority() != null) {
            t.setPriority(request.priority());
        }
        if (request.status() != null) {
            t.setStatus(request.status());
        }
        if (request.storyPoints() != null) {
            t.setStoryPoints(request.storyPoints());
        }

        return taskRepository.save(t);
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }
}