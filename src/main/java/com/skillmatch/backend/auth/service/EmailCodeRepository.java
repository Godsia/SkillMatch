package com.skillmatch.backend.auth.service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailCodeRepository extends JpaRepository<EmailVerificationCode, Long> {
    Optional<EmailVerificationCode> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
