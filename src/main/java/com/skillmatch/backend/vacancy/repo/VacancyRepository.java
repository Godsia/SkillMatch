package com.skillmatch.backend.vacancy.repo;

import com.skillmatch.backend.vacancy.model.Vacancy;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Long> {

    boolean existsBySourceAndSourceVacancyId(String source, String sourceVacancyId);

    @EntityGraph(attributePaths = {"skills"})
    List<Vacancy> findAllByOrderByPublishedAtDesc();

    @EntityGraph(attributePaths = {"skills"})
    List<Vacancy> findByIdNotInOrderByPublishedAtDesc(List<Long> ids);
}
