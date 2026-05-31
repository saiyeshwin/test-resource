package com.seveneleven.platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.seveneleven.platform.dto.ResourceDtos;
import com.seveneleven.platform.entity.Resource;
import com.seveneleven.platform.repository.ProjectRepository;
import com.seveneleven.platform.repository.ResourceRepository;
import com.seveneleven.platform.repository.UserRepository;

@Service
public class ResourceService {

	private final ResourceRepository resourceRepository;
	private final UserRepository userRepository;
	private final ProjectRepository projectRepository;

	public ResourceService(ResourceRepository resourceRepository, UserRepository userRepository,
			ProjectRepository projectRepository) {
		this.resourceRepository = resourceRepository;
		this.userRepository = userRepository;
		this.projectRepository = projectRepository;
	}

	public List<Resource> list(Long projectId, Long userId) {
		if (projectId != null) {
			return resourceRepository.findByProject_ProjectId(projectId);
		}
		if (userId != null) {
			return resourceRepository.findByUser_Id(userId);
		}
		return resourceRepository.findAll();
	}

	public Resource get(Long id) {
		return resourceRepository.findById(id).orElseThrow();
	}

	public Resource create(ResourceDtos.CreateRequest request) {
		Resource r = new Resource();
		r.setUser(userRepository.findById(request.userId()).orElseThrow());
		r.setProject(projectRepository.findById(request.projectId()).orElseThrow());
		r.setUtilizationPct(request.utilizationPct());
		r.setAvailability(request.availability());
		r.setFeedback(request.feedback());
		return resourceRepository.save(r);
	}

	public Resource update(Long id, ResourceDtos.UpdateRequest request) {
		Resource r = get(id);
		if (request.userId() != null) {
			r.setUser(userRepository.findById(request.userId()).orElseThrow());
		}
		if (request.projectId() != null) {
			r.setProject(projectRepository.findById(request.projectId()).orElseThrow());
		}
		if (request.utilizationPct() != null) {
			r.setUtilizationPct(request.utilizationPct());
		}
		if (request.availability() != null) {
			r.setAvailability(request.availability());
		}
		if (request.feedback() != null) {
			r.setFeedback(request.feedback());
		}
		return resourceRepository.save(r);
	}
}
