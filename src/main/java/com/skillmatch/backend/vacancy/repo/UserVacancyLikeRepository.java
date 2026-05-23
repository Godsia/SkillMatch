package com.skillmatch.backend.vacancy.repo;

import com.skillmatch.backend.vacancy.model.UserVacancyLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserVacancyLikeRepository extends JpaRepository<UserVacancyLike, Long> {

    long countByUserId(Long userId);

    long countByUserIdAndLikedTrue(Long userId);

    long countByUserIdAndLikedFalse(Long userId);

    Optional<UserVacancyLike> findByUserIdAndVacancyId(Long userId, Long vacancyId);

    @Query("select l.vacancyId from UserVacancyLike l where l.userId = :userId and l.liked = true")
    List<Long> findLikedVacancyIds(@Param("userId") Long userId);

    @Query("select l.vacancyId from UserVacancyLike l where l.userId = :userId and l.liked = false")
    List<Long> findDislikedVacancyIds(@Param("userId") Long userId);

    @Query("select l.vacancyId from UserVacancyLike l where l.userId = :userId")
    List<Long> findInteractedVacancyIds(@Param("userId") Long userId);

    List<UserVacancyLike> findAllByUserIdAndLikedTrue(Long userId);

    List<UserVacancyLike> findAllByUserIdAndLikedFalse(Long userId);
}
