package com.dsaroadmap.repositories;

import com.dsaroadmap.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    java.util.Optional<User> findByEmail(String email);

    interface LeaderboardProjection {
        String getName();
        Long getCompletedCount();
        Integer getCurrentStreak();
    }

    @org.springframework.data.jpa.repository.Query(
           "SELECT u.name AS name, SUM(CASE WHEN up.completed = true THEN 1L ELSE 0L END) AS completedCount, u.currentStreak AS currentStreak " +
           "FROM User u LEFT JOIN u.progress up " +
           "GROUP BY u.id, u.name, u.currentStreak " +
           "ORDER BY SUM(CASE WHEN up.completed = true THEN 1L ELSE 0L END) DESC, u.name ASC")
    java.util.List<LeaderboardProjection> getLeaderboard(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
           "SELECT u.name AS name, SUM(CASE WHEN up.completed = true AND UPPER(p.category) = UPPER(:category) THEN 1L ELSE 0L END) AS completedCount, u.currentStreak AS currentStreak " +
           "FROM User u LEFT JOIN u.progress up " +
           "LEFT JOIN up.problem p " +
           "GROUP BY u.id, u.name, u.currentStreak " +
           "ORDER BY SUM(CASE WHEN up.completed = true AND UPPER(p.category) = UPPER(:category) THEN 1L ELSE 0L END) DESC, u.name ASC")
    java.util.List<LeaderboardProjection> getLeaderboardByCategory(@org.springframework.data.repository.query.Param("category") String category, org.springframework.data.domain.Pageable pageable);
}
