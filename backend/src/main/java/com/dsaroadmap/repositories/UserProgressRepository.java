package com.dsaroadmap.repositories;

import com.dsaroadmap.models.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, UUID> {
    java.util.Optional<UserProgress> findByUserAndProblem(com.dsaroadmap.models.User user, com.dsaroadmap.models.Problem problem);
    java.util.List<UserProgress> findByUser(com.dsaroadmap.models.User user);
}
