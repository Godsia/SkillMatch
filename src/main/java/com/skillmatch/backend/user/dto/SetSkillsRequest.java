package com.skillmatch.backend.user.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SetSkillsRequest(
        @NotEmpty List<SkillItem> skills
) {
    public record SkillItem(Long skillId, String customSkill) {}
}
