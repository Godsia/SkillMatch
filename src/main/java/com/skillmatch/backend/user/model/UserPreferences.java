package com.skillmatch.backend.user.model;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    @Column(name="user_id")
    private Long userId;

    private String workFormats;

    private String employmentTypes;

    private String experienceLevel;

    private Integer salaryFrom;
    private Integer salaryTo;

    private String salaryPeriod;
}
