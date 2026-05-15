package com.skillmatch.backend.user.controller;

import com.skillmatch.backend.user.dto.*;
import com.skillmatch.backend.user.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return profileService.me(userId);
    }

    @PutMapping("/skills")
    public void setSkills(Authentication auth, @Valid @RequestBody SetSkillsRequest req) {
        Long userId = (Long) auth.getPrincipal();
        profileService.setSkills(userId, req);
    }

    @PutMapping("/preferences")
    public void setPreferences(Authentication auth, @RequestBody SetPreferencesRequest req) {
        Long userId = (Long) auth.getPrincipal();
        profileService.setPreferences(userId, req);
    }

    @DeleteMapping("/me")
    public void deleteAccount(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        profileService.deleteAccount(userId);
    }
}
