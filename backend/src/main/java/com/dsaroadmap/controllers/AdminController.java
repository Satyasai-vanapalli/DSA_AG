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
        var progressList = userProgressRepository.getUserProgressPerCategory();
        java.util.Map<UUID, java.util.Map<String, Long>> progressMap = new java.util.HashMap<>();
        for (var p : progressList) {
            progressMap.computeIfAbsent(p.getUserId(), k -> new java.util.HashMap<>()).put(p.getCategory(), p.getCompletedCount());
        }

        List<Map<String, Object>> users = userRepository.findAllByOrderByLastActiveTimeDesc().stream()
                .map(user -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", user.getId().toString());
                    map.put("name", user.getName());
                    map.put("email", user.getEmail());
                    map.put("role", user.getRole().name());
                    map.put("isBlocked", user.isBlocked());
                    map.put("lastActiveTime", user.getLastActiveTime() != null ? user.getLastActiveTime().toString() : null);
                    map.put("adminCategories", user.getAdminCategories() != null ? user.getAdminCategories() : new java.util.HashSet<>());
                    map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
                    map.put("totalActiveDays", user.getTotalActiveDays() != null ? user.getTotalActiveDays() : 0);
                    map.put("profilePictureUrl", user.getProfilePictureUrl());
                    
                    java.util.Map<String, Long> userProgress = progressMap.getOrDefault(user.getId(), new java.util.HashMap<>());
                    map.put("progress", userProgress);
                    
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

    @GetMapping("/users/{userId}/progress")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserDetailedProgress(@PathVariable UUID userId) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var progressList = userProgressRepository.findByUserWithProblem(targetUser);

        var solvedProblems = progressList.stream()
                .filter(up -> up.isCompleted())
                .map(up -> {
                    java.util.Map<String, Object> item = new java.util.HashMap<>();
                    item.put("problemId", up.getProblem().getId().toString());
                    item.put("title", up.getProblem().getTitle());
                    item.put("difficulty", up.getProblem().getDifficulty());
                    item.put("category", up.getProblem().getCategory());
                    item.put("completedAt", up.getCompletedAt() != null ? up.getCompletedAt().toString() : null);
                    return item;
                })
                .toList();

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("userId", targetUser.getId().toString());
        result.put("name", targetUser.getName());
        result.put("email", targetUser.getEmail());
        result.put("currentStreak", targetUser.getCurrentStreak());
        result.put("maxStreak", targetUser.getMaxStreak());
        result.put("totalActiveDays", targetUser.getTotalActiveDays() != null ? targetUser.getTotalActiveDays() : 0);
        result.put("createdAt", targetUser.getCreatedAt() != null ? targetUser.getCreatedAt().toString() : null);
        result.put("totalSolved", solvedProblems.size());
        result.put("solvedProblems", solvedProblems);

        return ResponseEntity.ok(result);
    }
}
