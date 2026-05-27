package com.seveneleven.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seveneleven.platform.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
