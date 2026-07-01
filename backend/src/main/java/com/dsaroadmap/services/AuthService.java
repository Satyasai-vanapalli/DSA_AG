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


    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        if (user.isBlocked()) {
            throw new RuntimeException("Your account has been blocked. Please contact support.");
        }
        
        user.setLastActiveTime(LocalDateTime.now());
        userRepository.save(user);
        
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAdminCategories());
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
        
        Role userRole = Role.STUDENT;
        if (request.getEmail().equals("2300031222cseh1@gmail.com") || 
            request.getEmail().equals("satyasaivanapalli47@gmail.com")) {
            userRole = Role.ADMIN;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .lastActiveTime(LocalDateTime.now())
                .build();

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAdminCategories());
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
    public void verifyResetOtp(ResetPasswordRequest request) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndPurpose(request.getEmail(), request.getOtp(), "FORGOT_PASSWORD")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
                
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndPurpose(request.getEmail(), request.getOtp(), "FORGOT_PASSWORD")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
                
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }
        
        otpTokenRepository.delete(otpToken);
        
        User user = userRepository.findByEmail(request.getEmail()).get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getNewPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAdminCategories());
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getTokenVersion());
                    return new TokenRefreshResponse(token, requestRefreshToken);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    private RefreshToken createRefreshToken(UUID userId) {
        User user = userRepository.findById(userId).get();
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user).orElse(new RefreshToken());
        
        refreshToken.setUser(user);
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
