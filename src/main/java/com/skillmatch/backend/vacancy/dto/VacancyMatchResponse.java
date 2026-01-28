package com.skillmatch.backend.vacancy.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacancyMatchResponse {
    private Long id;

    private String source;
    private String sourceVacancyId;

    private String title;
    private String descriptionPlain;

    private String url;
    private String employerName;
    private String employerLogoUrl;
    private String areaName;
    private Instant publishedAt;

    private Integer salaryFrom;
    private Integer salaryTo;
    private String salaryCurrency;
    private Boolean salaryGross;

    private List<String> skills;

    private double matchPercent;

    
    private boolean liked;
}
