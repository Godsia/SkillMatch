package com.skillmatch.backend.vacancy.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VacancyMatchStatsDto {
    private long totalVacancies;
    private long matchingCount;
}
