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

    @NotNull
    private Boolean likedMatching;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
}

