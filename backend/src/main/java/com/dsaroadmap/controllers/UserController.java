package com.dsaroadmap.controllers;

import com.dsaroadmap.repositories.UserRepository;
import com.dsaroadmap.services.AuthService;
import com.dsaroadmap.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final FileStorageService fileStorageService;

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserRepository.LeaderboardProjection>> getLeaderboard(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(userRepository.getLeaderboardByCategory(category, PageRequest.of(0, 50)));
        }
        return ResponseEntity.ok(userRepository.getLeaderboard(PageRequest.of(0, 50)));
    }

    @PostMapping("/ping")
    public ResponseEntity<Void> ping(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setLastActiveTime(LocalDateTime.now());
                // Increment active days if this is a new calendar day
                LocalDate today = LocalDate.now();
                if (user.getLastActiveDate() == null || !user.getLastActiveDate().equals(today)) {
                    user.setLastActiveDate(today);
                    user.setTotalActiveDays((user.getTotalActiveDays() == null ? 0 : user.getTotalActiveDays()) + 1);
                }
                userRepository.save(user);
            });
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(org.springframework.security.core.Authentication authentication, HttpServletResponse response) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setLastActiveTime(LocalDateTime.now().minusMinutes(5));
                userRepository.save(user);
            });
        }
        
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestParam(value = "name", required = false) String name,
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {
            // Delete old picture if exists
            if (user.getProfilePictureUrl() != null) {
                fileStorageService.deleteFile(user.getProfilePictureUrl());
            }
            String imageUrl = fileStorageService.saveFile(profilePicture);
            user.setProfilePictureUrl(imageUrl);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "name", user.getName(),
            "profilePictureUrl", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : ""
        ));
    }

    @PostMapping("/me/delete-account/send-otp")
    public ResponseEntity<Void> sendDeleteAccountOtp(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            authService.sendDeleteAccountOtp(authentication.getName());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/me/delete-account/verify")
    public ResponseEntity<Void> verifyAndDeleteAccount(
            @RequestBody java.util.Map<String, String> request,
            org.springframework.security.core.Authentication authentication,
            HttpServletResponse response) {
            
        if (authentication != null && authentication.isAuthenticated()) {
            String otp = request.get("otp");
            authService.verifyAndDeleteAccount(authentication.getName(), otp);
            
            ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(401).build();
    }
}
