package com.seveneleven.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seveneleven.platform.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findBySprint_SprintId(Long sprintId);
	List<Task> findByAssignee_Id(Long assigneeId);
}
