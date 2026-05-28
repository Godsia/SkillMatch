package com.skillmatch.backend.vacancy.service;

import com.skillmatch.backend.user.repo.SkillAnalyticsProjection;
import com.skillmatch.backend.user.repo.SkillRepository;
import com.skillmatch.backend.vacancy.dto.SkillDemandDto;
import com.skillmatch.backend.vacancy.dto.UserInteractionAnalyticsDto;
import com.skillmatch.backend.vacancy.dto.VacancyMatchStatsDto;
import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.user.repo.UserSkillRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import com.skillmatch.backend.vacancy.repo.UserVacancyLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillAnalyticsService {

    private final SkillRepository skillRepository;
    private final UserVacancyLikeRepository userVacancyLikeRepository;
    private final VacancyRepository vacancyRepository;
    private final UserSkillRepository userSkillRepository;
    private final VacancyMatchService vacancyMatchService;

    public List<SkillDemandDto> getTop10SkillsAllTime() {
        long totalSkillsAllTime = skillRepository.countAllVacancySkills();
        List<SkillAnalyticsProjection> topSkills = skillRepository.findTop10SkillsAllTime();

        return topSkills.stream().map(projection -> {
            double percent = 0.0;
            if (totalSkillsAllTime > 0) {
                percent = (projection.getAllTimeCnt() * 100.0) / totalSkillsAllTime;
            }

            return SkillDemandDto.builder()
                    .name(projection.getName())
                    .percent(Math.round(percent * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<SkillDemandDto> getTop10SkillsLastMonth() {
        Instant oneMonthAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        long totalSkillsLastMonth = skillRepository.countAllVacancySkillsSince(oneMonthAgo);
        List<SkillAnalyticsProjection> topSkills = skillRepository.findTop10SkillsLastMonth(oneMonthAgo);

        return topSkills.stream().map(projection -> {
            double percent = 0.0;
            if (totalSkillsLastMonth > 0 && projection.getMonthCnt() != null) {
                percent = (projection.getMonthCnt() * 100.0) / totalSkillsLastMonth;
            }

            return SkillDemandDto.builder()
                    .name(projection.getName())
                    .percent(Math.round(percent * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    public UserInteractionAnalyticsDto getUserInteractionAnalytics(Long userId) {
        long totalEvaluated = userVacancyLikeRepository.countByUserId(userId);
        long totalLiked = userVacancyLikeRepository.countByUserIdAndLikedTrue(userId);
        long totalDisliked = userVacancyLikeRepository.countByUserIdAndLikedFalse(userId);

        double percentLiked = 0.0;
        double percentDisliked = 0.0;

        if (totalEvaluated > 0) {
            percentLiked = (totalLiked * 100.0) / totalEvaluated;
            percentDisliked = (totalDisliked * 100.0) / totalEvaluated;
        }

        return UserInteractionAnalyticsDto.builder()
                .totalEvaluated(totalEvaluated)
                .totalLiked(totalLiked)
                .totalDisliked(totalDisliked)
                .percentLiked(Math.round(percentLiked * 100.0) / 100.0)
                .percentDisliked(Math.round(percentDisliked * 100.0) / 100.0)
                .build();
    }

    public VacancyMatchStatsDto getVacancyMatchStats(Long userId) {
        long totalVacancies = vacancyRepository.count();

        long matchingCount = vacancyMatchService.countMatchesForUser(userId);

        return VacancyMatchStatsDto.builder()
                .totalVacancies(totalVacancies)
                .matchingCount(matchingCount)
                .build();
    }
}
