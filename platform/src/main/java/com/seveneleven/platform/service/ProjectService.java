package com.seveneleven.platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.seveneleven.platform.dto.ProjectDtos;
import com.seveneleven.platform.entity.Project;
import com.seveneleven.platform.repository.ProjectRepository;
import com.seveneleven.platform.repository.UserRepository;

@Service
public class ProjectService {

	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;

	public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
		this.projectRepository = projectRepository;
		this.userRepository = userRepository;
	}

	public List<Project> list() {
		return projectRepository.findAll();
	}

	public Project get(Long id) {
		return projectRepository.findById(id).orElseThrow();
	}

	public Project create(ProjectDtos.CreateRequest request) {
		Project p = new Project();
		p.setName(request.name());
		p.setStartDate(request.startDate());
		p.setEndDate(request.endDate());
		if (request.managerId() != null) {
			p.setManager(userRepository.findById(request.managerId()).orElseThrow());
		}
		if (request.status() != null) {
			p.setStatus(request.status());
		}
		return projectRepository.save(p);
	}

	public Project update(Long id, ProjectDtos.UpdateRequest request) {
		Project p = get(id);
		if (request.name() != null && !request.name().isBlank()) {
			p.setName(request.name());
		}
		if (request.managerId() != null) {
			p.setManager(userRepository.findById(request.managerId()).orElseThrow());
		}
		if (request.startDate() != null) {
			p.setStartDate(request.startDate());
		}
		if (request.endDate() != null) {
			p.setEndDate(request.endDate());
		}
		if (request.status() != null) {
			p.setStatus(request.status());
		}
		if (request.delayRiskScore() != null) {
			p.setDelayRiskScore(request.delayRiskScore());
		}
		return projectRepository.save(p);
	}

	public void delete(Long id) {
		projectRepository.deleteById(id);
	}
}
