package com.skillmatch.backend.user.repo;

import com.skillmatch.backend.user.model.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findAllByUserId(Long userId);
    void deleteAllByUserId(Long userId);
    void deleteByUserIdAndSkillIdIn(Long userId, List<Long> skillIds);
}
