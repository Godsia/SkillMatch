package com.skillmatch.backend.vacancy.controller;

import com.skillmatch.backend.vacancy.dto.SkillDemandDto;
import com.skillmatch.backend.vacancy.dto.UserInteractionAnalyticsDto;
import com.skillmatch.backend.vacancy.service.SkillAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class SkillAnalyticsController {

    private final SkillAnalyticsService skillAnalyticsService;

    @GetMapping("/skills/top/all-time")
    public List<SkillDemandDto> getTopSkillsAllTime() {
        return skillAnalyticsService.getTop10SkillsAllTime();
    }

    @GetMapping("/skills/top/month")
    public List<SkillDemandDto> getTopSkillsLastMonth() {
        return skillAnalyticsService.getTop10SkillsLastMonth();
    }

    @GetMapping("/interactions")
    public UserInteractionAnalyticsDto getUserInteractions(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return skillAnalyticsService.getUserInteractionAnalytics(userId);
    }
}
