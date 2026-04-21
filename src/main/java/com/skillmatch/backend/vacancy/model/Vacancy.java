package com.skillmatch.backend.vacancy.model;

import com.skillmatch.backend.user.model.Skill;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "vacancies",
        uniqueConstraints = @UniqueConstraint(name = "ux_vacancies_source_id", columnNames = {"source", "source_vacancy_id"})
)
public class Vacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String source; 

    @Column(name = "source_vacancy_id", nullable = false, length = 50)
    private String sourceVacancyId; 

    @Column(length = 500)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "description_plain", columnDefinition = "text")
    private String descriptionPlain;

    @Column(columnDefinition = "text")
    private String url;

    @Column(name = "employer_name", length = 500)
    private String employerName;

    @Column(name = "employer_logo_url", columnDefinition = "text")
    private String employerLogoUrl;

    @Column(name = "area_name", length = 255)
    private String areaName;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "salary_from")
    private Integer salaryFrom;

    @Column(name = "salary_to")
    private Integer salaryTo;

    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency;

    @Column(name = "salary_gross")
    private Boolean salaryGross;

    @Column(name = "experience_level", length = 100)
    private String experienceLevel;

    @Column(name = "employment_type", length = 100)
    private String employmentType;

    @Column(name = "work_schedule", length = 100)
    private String workSchedule;

    @Column(name = "work_format", length = 100)
    private String workFormat;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "vacancy_skills",
            joinColumns = @JoinColumn(name = "vacancy_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();
}
