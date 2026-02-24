package com.skillmatch.backend.vacancy.controller;

import com.skillmatch.backend.vacancy.dto.VacancyFeedbackRequest;
import com.skillmatch.backend.vacancy.dto.VacancyFeedbackResponse;
import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.dto.VacancyLikeRequest;
import com.skillmatch.backend.vacancy.service.VacancyFeedbackService;
import com.skillmatch.backend.vacancy.service.VacancyMatchService;
import com.skillmatch.backend.vacancy.service.VacancyLikeService;
import jakarta.validation.Valid;
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
    private final VacancyFeedbackService vacancyFeedbackService;


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

    @PostMapping("/{vacancyId}/feedback")
    public void feedback(Authentication auth,
                         @PathVariable Long vacancyId,
                         @Valid @RequestBody VacancyFeedbackRequest req) {
        Long userId = (Long) auth.getPrincipal();
        vacancyFeedbackService.saveFeedback(userId, vacancyId, req.getLikedMatching(), req.getRating());
    }

    @GetMapping("/feedback")
    public List<VacancyFeedbackResponse> allFeedback(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return vacancyFeedbackService.getAllFeedback(userId);
    }
}
