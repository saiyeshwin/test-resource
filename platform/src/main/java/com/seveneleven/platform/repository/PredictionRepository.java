package com.seveneleven.platform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seveneleven.platform.entity.Prediction;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
	Optional<Prediction> findTopByProject_ProjectIdOrderByPredictionIdDesc(Long projectId);
}
