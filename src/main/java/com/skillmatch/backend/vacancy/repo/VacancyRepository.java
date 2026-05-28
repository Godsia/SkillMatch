package com.skillmatch.backend.vacancy.repo;

import com.skillmatch.backend.vacancy.model.Vacancy;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface VacancyRepository extends JpaRepository<Vacancy, Long> {

    boolean existsBySourceAndSourceVacancyId(String source, String sourceVacancyId);

    @EntityGraph(attributePaths = {"skills"})
    List<Vacancy> findAllByOrderByPublishedAtDesc();

    @EntityGraph(attributePaths = {"skills"})
    List<Vacancy> findByIdNotInOrderByPublishedAtDesc(List<Long> ids);

    @Query(value = "SELECT v.id as id, v.experience_level as experienceLevel, v.salary_from as salaryFrom, " +
                   "v.salary_to as salaryTo, v.employment_type as employmentType, v.work_format as workFormat, " +
                   "v.work_schedule as workSchedule, vs.skill_id as skillId " +
                   "FROM vacancies v " +
                   "LEFT JOIN vacancy_skills vs ON v.id = vs.vacancy_id ",
           nativeQuery = true)
    List<VacancyMatchProjection> findAllVacancyMatchInfo();

    @Query(value = "SELECT v.id as id, v.experience_level as experienceLevel, v.salary_from as salaryFrom, " +
                   "v.salary_to as salaryTo, v.employment_type as employmentType, v.work_format as workFormat, " +
                   "v.work_schedule as workSchedule, vs.skill_id as skillId " +
                   "FROM vacancies v " +
                   "LEFT JOIN vacancy_skills vs ON v.id = vs.vacancy_id " +
                   "WHERE v.id NOT IN :ignoreIds",
           nativeQuery = true)
    List<VacancyMatchProjection> findVacancyMatchInfoNotIn(@Param("ignoreIds") List<Long> ignoreIds);
}
