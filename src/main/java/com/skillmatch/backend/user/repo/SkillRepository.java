package com.skillmatch.backend.user.repo;

import com.skillmatch.backend.user.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);

    @Query(value = """
        SELECT 
            s.name as name, 
            COUNT(vs.vacancy_id) as allTimeCnt
        FROM skills s
        JOIN vacancy_skills vs ON s.id = vs.skill_id
        GROUP BY s.id, s.name
        ORDER BY allTimeCnt DESC
        LIMIT 10
    """, nativeQuery = true)
    List<SkillAnalyticsProjection> findTop10SkillsAllTime();

    @Query(value = """
        SELECT 
            s.name as name, 
            COUNT(vs.vacancy_id) as monthCnt
        FROM skills s
        JOIN vacancy_skills vs ON s.id = vs.skill_id
        JOIN vacancies v ON v.id = vs.vacancy_id
        WHERE v.published_at >= :since
        GROUP BY s.id, s.name
        ORDER BY monthCnt DESC
        LIMIT 10
    """, nativeQuery = true)
    List<SkillAnalyticsProjection> findTop10SkillsLastMonth(@Param("since") Instant since);

    @Query(value = "SELECT COUNT(*) FROM vacancy_skills", nativeQuery = true)
    long countAllVacancySkills();

    @Query(value = "SELECT COUNT(*) FROM vacancy_skills vs JOIN vacancies v ON vs.vacancy_id = v.id WHERE v.published_at >= :since", nativeQuery = true)
    long countAllVacancySkillsSince(@Param("since") Instant since);
}
