package com.skillmatch.backend.vacancy.repo;

import com.skillmatch.backend.vacancy.model.VacancyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VacancyFeedbackRepository extends JpaRepository<VacancyFeedback, Long> {

    Optional<VacancyFeedback> findByUserIdAndVacancyId(Long userId, Long vacancyId);

    List<VacancyFeedback> findAllByUserId(Long userId);
}




