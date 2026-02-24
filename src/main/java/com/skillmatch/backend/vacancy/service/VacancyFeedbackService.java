package com.skillmatch.backend.vacancy.service;

import com.skillmatch.backend.config.ApiException;
import com.skillmatch.backend.vacancy.dto.VacancyFeedbackResponse;
import com.skillmatch.backend.vacancy.model.VacancyFeedback;
import com.skillmatch.backend.vacancy.repo.VacancyFeedbackRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VacancyFeedbackService {

    private final VacancyRepository vacancyRepository;
    private final VacancyFeedbackRepository vacancyFeedbackRepository;

    @Transactional
    public void saveFeedback(Long userId, Long vacancyId, boolean likedMatching, int rating) {
        if (!vacancyRepository.existsById(vacancyId)) {
            throw new ApiException("Vacancy not found");
        }
        if (rating < 1 || rating > 5) {
            throw new ApiException("Rating must be between 1 and 5");
        }

        VacancyFeedback feedback = vacancyFeedbackRepository
                .findByUserIdAndVacancyId(userId, vacancyId)
                .orElseGet(() -> VacancyFeedback.builder()
                        .userId(userId)
                        .vacancyId(vacancyId)
                        .build());

        feedback.setLikedMatching(likedMatching);
        feedback.setRating(rating);
        vacancyFeedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<VacancyFeedbackResponse> getAllFeedback(Long userId) {
        return vacancyFeedbackRepository.findAllByUserId(userId).stream()
                .map(f -> VacancyFeedbackResponse.builder()
                        .id(f.getId())
                        .vacancyId(f.getVacancyId())
                        .likedMatching(f.isLikedMatching())
                        .rating(f.getRating())
                        .createdAt(f.getCreatedAt())
                        .build())
                .toList();
    }
}





