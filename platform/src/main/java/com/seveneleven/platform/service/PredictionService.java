package com.seveneleven.platform.service;

import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.seveneleven.platform.dto.PredictionDtos;
import com.seveneleven.platform.entity.Prediction;
import com.seveneleven.platform.repository.PredictionRepository;
import com.seveneleven.platform.repository.ProjectRepository;

@Service
public class PredictionService {

    private final RestClient restClient;
    private final String mlBaseUrl;
    private final ProjectRepository projectRepository;
    private final PredictionRepository predictionRepository;

    public PredictionService(RestClient restClient,
            @Value("${app.ml.base-url}") String mlBaseUrl,
            ProjectRepository projectRepository,
            PredictionRepository predictionRepository) {
        this.restClient = restClient;
        this.mlBaseUrl = mlBaseUrl;
        this.projectRepository = projectRepository;
        this.predictionRepository = predictionRepository;
    }

    public Prediction predict(Long projectId, PredictionDtos.MlRequest request) {
        PredictionDtos.MlRequest payload = request != null ? request : new PredictionDtos.MlRequest(42, 68, 91, 5);

        PredictionDtos.MlResponse ml = restClient.post()
                .uri(mlBaseUrl + "/predict")
                .body(payload)
                .retrieve()
                .body(PredictionDtos.MlResponse.class);

        if (ml == null) {
            throw new IllegalStateException("ML service returned empty response");
        }

        var project = projectRepository.findById(projectId).orElseThrow();
        Prediction p = new Prediction();
        p.setProject(project);
        p.setDelayProbability(ml.delay_probability());
        p.setRiskStatus(ml.status());
        p.setRecommendation("Review sprint plan and rebalance workload if needed");
        Prediction saved = predictionRepository.save(p);

        // optionally also store last score on project for dashboards
        project.setDelayRiskScore(ml.delay_probability());
        projectRepository.save(project);

        try {
            Map<String, Object> notificationPayload = Map.of(
                "projectId", projectId,
                "delay_probability", ml.delay_probability(),
                "status", ml.status()
            );

            restClient.post()
                    .uri("http://localhost:5000/api/notify/prediction") // Ideally pulled from @Value like above
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-api-key", "capstone_secret_key_2026")
                    .body(notificationPayload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Failed to alert Node service: " + e.getMessage());
        }

        return saved;
    }
}