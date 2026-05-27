package com.seveneleven.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seveneleven.platform.entity.Sprint;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
	List<Sprint> findByProject_ProjectId(Long projectId);
}
