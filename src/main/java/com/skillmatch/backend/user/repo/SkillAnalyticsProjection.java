package com.skillmatch.backend.user.repo;

public interface SkillAnalyticsProjection {
    String getName();
    Long getAllTimeCnt();
    Long getMonthCnt();
}

