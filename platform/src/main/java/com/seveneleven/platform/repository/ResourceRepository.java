package com.seveneleven.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seveneleven.platform.entity.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
	List<Resource> findByProject_ProjectId(Long projectId);
	List<Resource> findByUser_Id(Long userId);
}
