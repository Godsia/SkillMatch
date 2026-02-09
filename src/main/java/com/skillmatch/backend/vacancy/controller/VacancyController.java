package com.skillmatch.backend.vacancy.controller;

import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.dto.VacancyLikeRequest;
import com.skillmatch.backend.vacancy.service.VacancyMatchService;
import com.skillmatch.backend.vacancy.service.VacancyLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vacancies")
public class VacancyController {

    private final VacancyMatchService vacancyMatchService;
    private final VacancyLikeService vacancyLikeService;


    @GetMapping("/matches")
    public List<VacancyMatchResponse> matches(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return vacancyMatchService.listMatchesForUser(userId);
    }


    @PostMapping("/{vacancyId}/like")
    public void like(Authentication auth, @PathVariable Long vacancyId, @RequestBody VacancyLikeRequest req) {
        Long userId = (Long) auth.getPrincipal();
        boolean liked = (req != null && req.isLiked());
        vacancyLikeService.setLike(userId, vacancyId, liked);
    }


    @GetMapping("/liked")
    public List<VacancyMatchResponse> liked(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return vacancyMatchService.listLikedForUser(userId);
    }

    @GetMapping("/disliked")
    public List<VacancyMatchResponse> disliked(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return vacancyMatchService.listDislikedForUser(userId);
    }
}
