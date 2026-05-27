package com.seveneleven.platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.seveneleven.platform.dto.FeedbackDtos;
import com.seveneleven.platform.entity.Feedback;
import com.seveneleven.platform.repository.FeedbackRepository;
import com.seveneleven.platform.repository.UserRepository;

@Service
public class FeedbackService {

	private final FeedbackRepository feedbackRepository;
	private final UserRepository userRepository;

	public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
		this.feedbackRepository = feedbackRepository;
		this.userRepository = userRepository;
	}

	public List<Feedback> list(Long developerId) {
		if (developerId != null) {
			return feedbackRepository.findByDeveloper_Id(developerId);
		}
		return feedbackRepository.findAll();
	}

	public Feedback create(FeedbackDtos.CreateRequest request) {
		Feedback f = new Feedback();
		f.setManager(userRepository.findById(request.managerId()).orElseThrow());
		f.setDeveloper(userRepository.findById(request.developerId()).orElseThrow());
		f.setComments(request.comments());
		return feedbackRepository.save(f);
	}
}
