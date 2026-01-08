package com.skillmatch.backend.user.repo;

import com.skillmatch.backend.user.model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
}
