package com.skillmatch.backend.vacancy.service;

import com.skillmatch.backend.config.ApiException;
import com.skillmatch.backend.vacancy.model.UserVacancyLike;
import com.skillmatch.backend.vacancy.repo.UserVacancyLikeRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VacancyLikeService {

    private final VacancyRepository vacancyRepository;
    private final UserVacancyLikeRepository userVacancyLikeRepository;

    @Transactional
    public void setLike(Long userId, Long vacancyId, boolean liked) {
        if (!vacancyRepository.existsById(vacancyId)) {
            throw new ApiException("Vacancy not found");
        }

        UserVacancyLike rec = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, vacancyId)
                .orElseGet(() -> UserVacancyLike.builder()
                        .userId(userId)
                        .vacancyId(vacancyId)
                        .liked(liked)
                        .build());

        rec.setLiked(liked);
        userVacancyLikeRepository.save(rec);
    }
}
