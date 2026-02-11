package com.skillmatch.backend.vacancy.service;

import com.skillmatch.backend.user.repo.UserSkillRepository;
import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import com.skillmatch.backend.vacancy.repo.UserVacancyLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VacancyMatchService {

    private final VacancyRepository vacancyRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserVacancyLikeRepository userVacancyLikeRepository;

    public List<VacancyMatchResponse> listMatchesForUser(Long userId) {

        Set<Long> userSkillIds = userSkillRepository.findAllByUserId(userId).stream()
                .map(us -> us.getSkillId())
                .collect(Collectors.toSet());

        // Exclude vacancies that the user already interacted with (liked OR disliked)
        List<Long> interactedIds = userVacancyLikeRepository.findInteractedVacancyIds(userId);
        List<Vacancy> vacancies = interactedIds.isEmpty()
                ? vacancyRepository.findAllByOrderByPublishedAtDesc()
                : vacancyRepository.findByIdNotInOrderByPublishedAtDesc(interactedIds);

        Set<Long> likedVacancyIds = new HashSet<>(userVacancyLikeRepository.findLikedVacancyIds(userId));

        List<VacancyMatchResponse> res = new ArrayList<>(vacancies.size());

        for (Vacancy v : vacancies) {
            int total = (v.getSkills() == null) ? 0 : v.getSkills().size();
            int overlap = 0;

            List<String> skillNames = List.of();
            if (v.getSkills() != null && !v.getSkills().isEmpty()) {
                skillNames = v.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted(String::compareToIgnoreCase)
                        .collect(Collectors.toList());

                for (var s : v.getSkills()) {
                    if (s.getId() != null && userSkillIds.contains(s.getId())) {
                        overlap++;
                    }
                }
            }

            double matchPercent = (total == 0) ? 0.0 : (100.0 * overlap / (double) total);

            res.add(VacancyMatchResponse.builder()
                    .id(v.getId())
                    .source(v.getSource())
                    .sourceVacancyId(v.getSourceVacancyId())
                    .title(v.getTitle())
                    .descriptionPlain(v.getDescriptionPlain())
                    .url(v.getUrl())
                    .employerName(v.getEmployerName())
                    .employerLogoUrl(v.getEmployerLogoUrl())
                    .areaName(v.getAreaName())
                    .publishedAt(v.getPublishedAt())
                    .salaryFrom(v.getSalaryFrom())
                    .salaryTo(v.getSalaryTo())
                    .salaryCurrency(v.getSalaryCurrency())
                    .salaryGross(v.getSalaryGross())
                    .skills(skillNames)
                    .matchPercent(matchPercent)
                    .liked(likedVacancyIds.contains(v.getId()))
                    .build());
        }


        res.sort(Comparator
                .comparingDouble(VacancyMatchResponse::getMatchPercent).reversed()
                .thenComparing(VacancyMatchResponse::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(VacancyMatchResponse::getId));

        return res;
    }

    public List<VacancyMatchResponse> listLikedForUser(Long userId) {
        Set<Long> userSkillIds = userSkillRepository.findAllByUserId(userId).stream()
                .map(us -> us.getSkillId())
                .collect(Collectors.toSet());

        List<Long> likedIds = userVacancyLikeRepository.findLikedVacancyIds(userId);
        if (likedIds.isEmpty()) return List.of();

        List<Vacancy> vacancies = vacancyRepository.findAllById(likedIds);

        List<VacancyMatchResponse> res = new ArrayList<>(vacancies.size());
        for (Vacancy v : vacancies) {
            int total = (v.getSkills() == null) ? 0 : v.getSkills().size();
            int overlap = 0;

            List<String> skillNames = List.of();
            if (v.getSkills() != null && !v.getSkills().isEmpty()) {
                skillNames = v.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted(String::compareToIgnoreCase)
                        .collect(Collectors.toList());

                for (var s : v.getSkills()) {
                    if (s.getId() != null && userSkillIds.contains(s.getId())) {
                        overlap++;
                    }
                }
            }

            double matchPercent = (total == 0) ? 0.0 : (100.0 * overlap / (double) total);

            res.add(VacancyMatchResponse.builder()
                    .id(v.getId())
                    .source(v.getSource())
                    .sourceVacancyId(v.getSourceVacancyId())
                    .title(v.getTitle())
                    .descriptionPlain(v.getDescriptionPlain())
                    .url(v.getUrl())
                    .employerName(v.getEmployerName())
                    .employerLogoUrl(v.getEmployerLogoUrl())
                    .areaName(v.getAreaName())
                    .publishedAt(v.getPublishedAt())
                    .salaryFrom(v.getSalaryFrom())
                    .salaryTo(v.getSalaryTo())
                    .salaryCurrency(v.getSalaryCurrency())
                    .salaryGross(v.getSalaryGross())
                    .skills(skillNames)
                    .matchPercent(matchPercent)
                    .liked(true)
                    .build());
        }

        res.sort(Comparator
                .comparingDouble(VacancyMatchResponse::getMatchPercent).reversed()
                .thenComparing(VacancyMatchResponse::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(VacancyMatchResponse::getId));

        return res;
    }

    public List<VacancyMatchResponse> listDislikedForUser(Long userId) {
        Set<Long> userSkillIds = userSkillRepository.findAllByUserId(userId).stream()
                .map(us -> us.getSkillId())
                .collect(Collectors.toSet());

        List<Long> dislikedIds = userVacancyLikeRepository.findDislikedVacancyIds(userId);
        if (dislikedIds.isEmpty()) return List.of();

        List<Vacancy> vacancies = vacancyRepository.findAllById(dislikedIds);

        List<VacancyMatchResponse> res = new ArrayList<>(vacancies.size());
        for (Vacancy v : vacancies) {
            int total = (v.getSkills() == null) ? 0 : v.getSkills().size();
            int overlap = 0;

            List<String> skillNames = List.of();
            if (v.getSkills() != null && !v.getSkills().isEmpty()) {
                skillNames = v.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted(String::compareToIgnoreCase)
                        .collect(Collectors.toList());

                for (var s : v.getSkills()) {
                    if (s.getId() != null && userSkillIds.contains(s.getId())) {
                        overlap++;
                    }
                }
            }

            double matchPercent = (total == 0) ? 0.0 : (100.0 * overlap / (double) total);

            res.add(VacancyMatchResponse.builder()
                    .id(v.getId())
                    .source(v.getSource())
                    .sourceVacancyId(v.getSourceVacancyId())
                    .title(v.getTitle())
                    .descriptionPlain(v.getDescriptionPlain())
                    .url(v.getUrl())
                    .employerName(v.getEmployerName())
                    .employerLogoUrl(v.getEmployerLogoUrl())
                    .areaName(v.getAreaName())
                    .publishedAt(v.getPublishedAt())
                    .salaryFrom(v.getSalaryFrom())
                    .salaryTo(v.getSalaryTo())
                    .salaryCurrency(v.getSalaryCurrency())
                    .salaryGross(v.getSalaryGross())
                    .skills(skillNames)
                    .matchPercent(matchPercent)
                    .liked(false)
                    .build());
        }

        res.sort(Comparator
                .comparingDouble(VacancyMatchResponse::getMatchPercent).reversed()
                .thenComparing(VacancyMatchResponse::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(VacancyMatchResponse::getId));

        return res;
    }
}
