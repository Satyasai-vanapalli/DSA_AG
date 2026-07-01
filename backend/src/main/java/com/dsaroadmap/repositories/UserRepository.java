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
           "SELECT u.name AS name, COUNT(up.id) AS completedCount, u.currentStreak AS currentStreak " +
           "FROM UserProgress up JOIN up.user u " +
           "WHERE up.completed = true " +
           "GROUP BY u.id, u.name, u.currentStreak " +
           "ORDER BY COUNT(up.id) DESC")
    java.util.List<LeaderboardProjection> getLeaderboard(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
           "SELECT u.name AS name, COUNT(up.id) AS completedCount, u.currentStreak AS currentStreak " +
           "FROM UserProgress up JOIN up.user u JOIN up.problem p " +
           "WHERE up.completed = true AND p.category = :category " +
           "GROUP BY u.id, u.name, u.currentStreak " +
           "ORDER BY COUNT(up.id) DESC")
    java.util.List<LeaderboardProjection> getLeaderboardByCategory(@org.springframework.data.repository.query.Param("category") String category, org.springframework.data.domain.Pageable pageable);
}
