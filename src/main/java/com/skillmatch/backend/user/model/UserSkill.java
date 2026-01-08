package com.skillmatch.backend.user.model;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@Entity
@Table(name = "user_skills",
        uniqueConstraints = @UniqueConstraint(name="ux_user_skill", columnNames = {"user_id","skill_id"}))
public class UserSkill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable = false)
    private Long userId;

    @Column(name="skill_id", nullable = false)
    private Long skillId;
}
