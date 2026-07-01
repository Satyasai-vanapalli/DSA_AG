package com.dsaroadmap.controllers;

import com.dsaroadmap.models.ConceptProgress;
import com.dsaroadmap.models.UserProgress;
import com.dsaroadmap.security.CustomUserDetails;
import com.dsaroadmap.services.UserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class UserProgressController {

    private final UserProgressService userProgressService;

    @PostMapping("/toggle-completed/{problemId}")
    public ResponseEntity<UserProgress> toggleCompleted(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID problemId,
            @RequestParam(required = false) Integer timeSpent) {
        return ResponseEntity.ok(userProgressService.toggleCompleted(userDetails.getUsername(), problemId, timeSpent));
    }

    @PostMapping("/toggle-revision/{problemId}")
    public ResponseEntity<UserProgress> toggleRevision(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID problemId) {
        return ResponseEntity.ok(userProgressService.toggleRevision(userDetails.getUsername(), problemId));
    }

    @PostMapping("/last-opened/{problemId}")
    public ResponseEntity<UserProgress> updateLastOpened(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID problemId) {
        return ResponseEntity.ok(userProgressService.updateLastOpened(userDetails.getUsername(), problemId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<UserProgress>> getMyProgress(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userProgressService.getUserProgress(userDetails.getUsername()));
    }
    
    @GetMapping("/me/concepts")
    public ResponseEntity<List<ConceptProgress>> getMyConceptProgress(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userProgressService.getConceptProgress(userDetails.getUsername()));
    }
    
    @PostMapping("/toggle-concept-completed/{conceptId}")
    public ResponseEntity<ConceptProgress> toggleConceptCompleted(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID conceptId) {
        return ResponseEntity.ok(userProgressService.toggleConceptCompleted(userDetails.getUsername(), conceptId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMyStats(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(userProgressService.getUserStats(userDetails.getUsername(), category));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getMyAnalytics(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(userProgressService.getUserAnalytics(userDetails.getUsername(), category));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<Map<String, Long>> getHeatmap(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String category) {
        List<LocalDate> dates = userProgressService.getHeatmap(userDetails.getUsername(), category);
        Map<String, Long> counts = dates.stream()
            .collect(Collectors.groupingBy(LocalDate::toString, Collectors.counting()));
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<UserProgress>> getDueReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userProgressService.getDueReviews(userDetails.getUsername()));
    }

    @PostMapping("/review/{problemId}")
    public ResponseEntity<UserProgress> submitReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID problemId,
            @RequestParam boolean remembered) {
        return ResponseEntity.ok(userProgressService.submitReview(userDetails.getUsername(), problemId, remembered));
    }
}
