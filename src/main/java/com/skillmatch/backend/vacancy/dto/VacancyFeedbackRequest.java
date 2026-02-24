package com.skillmatch.backend.vacancy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VacancyFeedbackRequest {

    /** Понравился ли процесс мэтчинга */
    @NotNull
    private Boolean likedMatching;

    /** Оценка соответствия вакансии запросам пользователя (1–5) */
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
}

