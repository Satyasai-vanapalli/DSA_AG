package com.dsaroadmap.controllers;

import com.dsaroadmap.models.Role;
import com.dsaroadmap.models.User;
import com.dsaroadmap.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ConceptRepository conceptRepository;
    private final ProblemRepository problemRepository;
    private final ProblemVideoRepository problemVideoRepository;
    private final SolutionRepository solutionRepository;
    private final UserProgressRepository userProgressRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpTokenRepository otpTokenRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalConcepts", conceptRepository.count(),
                "totalProblems", problemRepository.count(),
                "totalVideos", problemVideoRepository.count(),
                "totalSolutions", solutionRepository.count()
        ));
    }

    @GetMapping("/insights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInsights() {
        org.springframework.data.domain.Pageable top10 = org.springframework.data.domain.PageRequest.of(0, 10);
        return ResponseEntity.ok(Map.of(
            "activeUsers", userRepository.count(), // Could filter by last login if we had it
            "popularProblems", userProgressRepository.getPopularProblems(top10),
            "struggledProblems", userProgressRepository.getStruggledProblems(top10)
        ));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", user.getId().toString());
                    map.put("name", user.getName());
                    map.put("email", user.getEmail());
                    map.put("role", user.getRole().name());
                    map.put("isBlocked", user.isBlocked());
                    map.put("lastActiveTime", user.getLastActiveTime() != null ? user.getLastActiveTime().toString() : null);
                    map.put("adminCategories", user.getAdminCategories() != null ? user.getAdminCategories() : new java.util.HashSet<>());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{userId}/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> promoteUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.ADMIN);
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User promoted to ADMIN", "email", user.getEmail()));
    }

    @PostMapping("/users/{userId}/demote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> demoteUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.STUDENT);
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User demoted to STUDENT", "email", user.getEmail()));
    }

    @PostMapping("/users/{userId}/category-admin/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> toggleCategoryAdmin(@PathVariable UUID userId, @PathVariable String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getAdminCategories() == null) {
            user.setAdminCategories(new java.util.HashSet<>());
        }
        
        boolean added;
        if (user.getAdminCategories().contains(category)) {
            user.getAdminCategories().remove(category);
            added = false;
        } else {
            user.getAdminCategories().add(category);
            added = true;
        }
        
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "message", added ? "Category Admin rights added" : "Category Admin rights removed",
            "email", user.getEmail(),
            "category", category,
            "status", added ? "added" : "removed"
        ));
    }

    @PostMapping("/users/{userId}/logout")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> forceLogoutUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User forcibly logged out", "email", user.getEmail()));
    }

    @PostMapping("/users/{userId}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> blockUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User blocked successfully", "email", user.getEmail()));
    }

    @PostMapping("/users/{userId}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> unblockUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User unblocked successfully", "email", user.getEmail()));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userProgressRepository.deleteByUser(user);
        refreshTokenRepository.deleteByUser(user);
        otpTokenRepository.deleteByEmail(user.getEmail());
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "User completely deleted", "email", user.getEmail()));
    }
}
