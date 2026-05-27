package com.seveneleven.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seveneleven.platform.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
	List<Feedback> findByDeveloper_Id(Long developerId);
}
