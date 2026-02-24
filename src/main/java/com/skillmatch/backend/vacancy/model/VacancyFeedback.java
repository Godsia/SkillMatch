package com.skillmatch.backend.vacancy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "vacancy_feedback",
        uniqueConstraints = @UniqueConstraint(name = "ux_vacancy_feedback", columnNames = {"user_id", "vacancy_id"})
)
public class VacancyFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "vacancy_id", nullable = false)
    private Long vacancyId;

    @Column(name = "liked_matching", nullable = false)
    private boolean likedMatching;

    @Column(name = "rating", nullable = false)
    private int rating;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}



