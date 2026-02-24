package com.skillmatch.backend.vacancy.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacancyFeedbackResponse {
    private Long id;
    private Long vacancyId;
    private boolean likedMatching;
    private int rating;
    private Instant createdAt;
}

