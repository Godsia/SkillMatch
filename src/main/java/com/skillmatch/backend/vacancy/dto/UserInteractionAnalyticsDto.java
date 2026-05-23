package com.skillmatch.backend.vacancy.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserInteractionAnalyticsDto {
    private long totalEvaluated;
    private long totalLiked;
    private long totalDisliked;
    private double percentLiked;
    private double percentDisliked;
}

