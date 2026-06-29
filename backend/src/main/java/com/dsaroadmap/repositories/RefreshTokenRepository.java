package com.dsaroadmap.repositories;

import com.dsaroadmap.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    java.util.Optional<RefreshToken> findByToken(String token);
    int deleteByUser(com.dsaroadmap.models.User user);
}
