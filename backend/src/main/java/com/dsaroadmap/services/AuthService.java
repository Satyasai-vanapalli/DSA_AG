package com.dsaroadmap.services;

import com.dsaroadmap.dto.*;
import com.dsaroadmap.models.OtpToken;
import com.dsaroadmap.models.RefreshToken;
import com.dsaroadmap.models.Role;
import com.dsaroadmap.models.User;
import com.dsaroadmap.repositories.OtpTokenRepository;
import com.dsaroadmap.repositories.RefreshTokenRepository;
import com.dsaroadmap.repositories.UserRepository;
import com.dsaroadmap.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenDurationMs;

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Transactional
    public void sendSignupOtp(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }
        
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        otpTokenRepository.deleteByEmailAndPurpose(request.getEmail(), "SIGNUP");
        
        OtpToken token = new OtpToken();
        token.setEmail(request.getEmail());
        token.setOtp(otp);
        token.setPurpose("SIGNUP");
        token.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(token);
        
        emailService.sendOtpEmail(request.getEmail(), otp, "SIGNUP");
    }

    @Transactional
    public AuthResponse verifySignup(VerifyRegisterRequest request) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndPurpose(request.getEmail(), request.getOtp(), "SIGNUP")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
                
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }
        
        otpTokenRepository.delete(otpToken);
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
    
    @Transactional
    public void sendForgotPasswordOtp(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        otpTokenRepository.deleteByEmailAndPurpose(request.getEmail(), "FORGOT_PASSWORD");
        
        OtpToken token = new OtpToken();
        token.setEmail(request.getEmail());
        token.setOtp(otp);
        token.setPurpose("FORGOT_PASSWORD");
        token.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(token);
        
        emailService.sendOtpEmail(request.getEmail(), otp, "FORGOT_PASSWORD");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndPurpose(request.getEmail(), request.getOtp(), "FORGOT_PASSWORD")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
                
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }
        
        otpTokenRepository.delete(otpToken);
        
        User user = userRepository.findByEmail(request.getEmail()).get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = tokenProvider.generateTokenFromEmail(user.getEmail());
                    TokenRefreshResponse res = new TokenRefreshResponse();
                    res.setAccessToken(token);
                    res.setRefreshToken(requestRefreshToken);
                    return res;
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    private RefreshToken createRefreshToken(UUID userId) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userRepository.findById(userId).get());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
}
