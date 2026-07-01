package com.dsaroadmap.controllers;

import com.dsaroadmap.repositories.UserRepository;
import com.dsaroadmap.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

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
                user.setLastActiveTime(java.time.LocalDateTime.now());
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
                // Set to 5 minutes ago to immediately appear offline
                user.setLastActiveTime(java.time.LocalDateTime.now().minusMinutes(5));
                userRepository.save(user);
            });
        }
        
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
            .httpOnly(true)
            .secure(false) // Adjust for production
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok().build();
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
            
            // Clear JWT cookie
            ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true) // Adjust for production
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
