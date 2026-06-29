package com.dsaroadmap.repositories;

import com.dsaroadmap.models.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findByEmailAndOtpAndPurpose(String email, String otp, String purpose);
    void deleteByEmailAndPurpose(String email, String purpose);
}
