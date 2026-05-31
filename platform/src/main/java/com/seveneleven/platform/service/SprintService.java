package com.seveneleven.platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.seveneleven.platform.dto.SprintDtos;
import com.seveneleven.platform.entity.Sprint;
import com.seveneleven.platform.repository.ProjectRepository;
import com.seveneleven.platform.repository.SprintRepository;

@Service
public class SprintService {

	private final SprintRepository sprintRepository;
	private final ProjectRepository projectRepository;

	public SprintService(SprintRepository sprintRepository, ProjectRepository projectRepository) {
		this.sprintRepository = sprintRepository;
		this.projectRepository = projectRepository;
	}

	public List<Sprint> list(Long projectId) {
		if (projectId != null) {
			return sprintRepository.findByProject_ProjectId(projectId);
		}
		return sprintRepository.findAll();
	}

	public Sprint get(Long id) {
		return sprintRepository.findById(id).orElseThrow();
	}

	public Sprint create(SprintDtos.CreateRequest request) {
		Sprint s = new Sprint();
		s.setProject(projectRepository.findById(request.projectId()).orElseThrow());
		s.setSprintName(request.sprintName());
		s.setVelocity(request.velocity());
		s.setStartDate(request.startDate());
		s.setEndDate(request.endDate());
		if (request.status() != null) {
			s.setStatus(request.status());
		}
		return sprintRepository.save(s);
	}

	public Sprint update(Long id, SprintDtos.UpdateRequest request) {
		Sprint s = get(id);
		if (request.sprintName() != null && !request.sprintName().isBlank()) {
			s.setSprintName(request.sprintName());
		}
		if (request.velocity() != null) {
			s.setVelocity(request.velocity());
		}
		if (request.startDate() != null) {
			s.setStartDate(request.startDate());
		}
		if (request.endDate() != null) {
			s.setEndDate(request.endDate());
		}
		if (request.status() != null) {
			s.setStatus(request.status());
		}
		return sprintRepository.save(s);
	}
}
