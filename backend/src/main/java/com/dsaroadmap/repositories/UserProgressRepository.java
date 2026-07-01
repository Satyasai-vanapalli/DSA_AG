package com.dsaroadmap.repositories;

import com.dsaroadmap.models.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, UUID> {
    java.util.Optional<UserProgress> findByUserAndProblem(com.dsaroadmap.models.User user, com.dsaroadmap.models.Problem problem);
    java.util.List<UserProgress> findByUser(com.dsaroadmap.models.User user);
    void deleteByUser(com.dsaroadmap.models.User user);

    @org.springframework.data.jpa.repository.Query("SELECT up FROM UserProgress up JOIN FETCH up.problem WHERE up.user = :user")
    java.util.List<UserProgress> findByUserWithProblem(@org.springframework.data.repository.query.Param("user") com.dsaroadmap.models.User user);

    @org.springframework.data.jpa.repository.Query("SELECT up FROM UserProgress up JOIN FETCH up.problem WHERE up.user = :user AND up.revision = true AND up.nextReviewDate <= :date")
    java.util.List<UserProgress> findDueForReview(@org.springframework.data.repository.query.Param("user") com.dsaroadmap.models.User user, @org.springframework.data.repository.query.Param("date") java.time.LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT up.completedAt FROM UserProgress up WHERE up.user = :user AND up.completedAt IS NOT NULL")
    java.util.List<java.time.LocalDate> findCompletedDatesByUser(@org.springframework.data.repository.query.Param("user") com.dsaroadmap.models.User user);

    @org.springframework.data.jpa.repository.Query("SELECT up.completedAt FROM UserProgress up JOIN up.problem p WHERE up.user = :user AND up.completedAt IS NOT NULL AND p.category = :category")
    java.util.List<java.time.LocalDate> findCompletedDatesByUserAndCategory(@org.springframework.data.repository.query.Param("user") com.dsaroadmap.models.User user, @org.springframework.data.repository.query.Param("category") String category);


    interface PopularProblemProjection {
        String getTitle();
        Long getCompletedCount();
    }
    
    @org.springframework.data.jpa.repository.Query(
        "SELECT p.title AS title, COUNT(up.id) AS completedCount " +
        "FROM UserProgress up JOIN up.problem p " +
        "WHERE up.completed = true " +
        "GROUP BY p.id, p.title " +
        "ORDER BY COUNT(up.id) DESC"
    )
    java.util.List<PopularProblemProjection> getPopularProblems(org.springframework.data.domain.Pageable pageable);

    interface StruggledProblemProjection {
        String getTitle();
        Double getAverageTime();
    }

    @org.springframework.data.jpa.repository.Query(
        "SELECT p.title AS title, AVG(up.timeSpent) AS averageTime " +
        "FROM UserProgress up JOIN up.problem p " +
        "WHERE up.timeSpent IS NOT NULL " +
        "GROUP BY p.id, p.title " +
        "ORDER BY AVG(up.timeSpent) DESC"
    )
    java.util.List<StruggledProblemProjection> getStruggledProblems(org.springframework.data.domain.Pageable pageable);
}
