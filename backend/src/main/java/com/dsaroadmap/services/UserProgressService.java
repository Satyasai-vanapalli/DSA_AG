package com.dsaroadmap.services;

import com.dsaroadmap.models.Concept;
import com.dsaroadmap.models.ConceptProgress;
import com.dsaroadmap.models.Problem;
import com.dsaroadmap.models.User;
import com.dsaroadmap.models.UserProgress;
import com.dsaroadmap.repositories.ConceptRepository;
import com.dsaroadmap.repositories.ConceptProgressRepository;
import com.dsaroadmap.repositories.ProblemRepository;
import com.dsaroadmap.repositories.UserProgressRepository;
import com.dsaroadmap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptProgressRepository conceptProgressRepository;

    @Transactional
    public UserProgress toggleCompleted(String userEmail, UUID problemId, Integer timeSpent) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserProgress progress = userProgressRepository.findByUserAndProblem(user, problem)
                .orElse(UserProgress.builder()
                        .user(user)
                        .problem(problem)
                        .completed(false)
                        .revision(false)
                        .build());

        progress.setCompleted(!progress.isCompleted());
        if (progress.isCompleted()) {
            progress.setCompletedAt(LocalDate.now());
            updateUserStreak(user);
        }
        if (timeSpent != null) {
            progress.setTimeSpent(timeSpent);
        }
        progress.setLastOpenedAt(LocalDateTime.now());
        return userProgressRepository.save(progress);
    }

    private void updateUserStreak(User user) {
        LocalDate today = LocalDate.now();
        if (user.getLastActiveTime() == null) {
            user.setCurrentStreak(1);
            user.setMaxStreak(Math.max(user.getMaxStreak(), 1));
            user.setLastActiveTime(LocalDateTime.now());
        } else if (user.getLastActiveTime().toLocalDate().isEqual(today.minusDays(1))) {
            int newStreak = user.getCurrentStreak() + 1;
            user.setCurrentStreak(newStreak);
            user.setMaxStreak(Math.max(user.getMaxStreak(), newStreak));
            user.setLastActiveTime(LocalDateTime.now());
        } else if (user.getLastActiveTime().toLocalDate().isBefore(today.minusDays(1))) {
            user.setCurrentStreak(1);
            user.setMaxStreak(Math.max(user.getMaxStreak(), 1));
            user.setLastActiveTime(LocalDateTime.now());
        }
        userRepository.save(user);
    }

    @Transactional
    public UserProgress toggleRevision(String userEmail, UUID problemId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserProgress progress = userProgressRepository.findByUserAndProblem(user, problem)
                .orElse(UserProgress.builder()
                        .user(user)
                        .problem(problem)
                        .completed(false)
                        .revision(false)
                        .build());

        progress.setRevision(!progress.isRevision());
        if (progress.isRevision()) {
            progress.setReviewIntervalDays(1);
            progress.setNextReviewDate(LocalDate.now().plusDays(1));
        } else {
            progress.setReviewIntervalDays(0);
            progress.setNextReviewDate(null);
        }
        progress.setLastOpenedAt(LocalDateTime.now());
        return userProgressRepository.save(progress);
    }

    @Transactional
    public UserProgress submitReview(String userEmail, UUID problemId, boolean remembered) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserProgress progress = userProgressRepository.findByUserAndProblem(user, problem)
                .orElseThrow(() -> new RuntimeException("Progress not found"));

        if (!progress.isRevision()) return progress;

        if (remembered) {
            int currentInterval = progress.getReviewIntervalDays() != null ? progress.getReviewIntervalDays() : 1;
            int nextInterval = currentInterval == 1 ? 3 : (currentInterval == 3 ? 7 : (currentInterval == 7 ? 21 : currentInterval * 2));
            progress.setReviewIntervalDays(nextInterval);
            progress.setNextReviewDate(LocalDate.now().plusDays(nextInterval));
        } else {
            progress.setReviewIntervalDays(1);
            progress.setNextReviewDate(LocalDate.now().plusDays(1));
        }

        return userProgressRepository.save(progress);
    }

    @Transactional
    public UserProgress updateLastOpened(String userEmail, UUID problemId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserProgress progress = userProgressRepository.findByUserAndProblem(user, problem)
                .orElse(UserProgress.builder()
                        .user(user)
                        .problem(problem)
                        .completed(false)
                        .revision(false)
                        .build());

        progress.setLastOpenedAt(LocalDateTime.now());
        return userProgressRepository.save(progress);
    }

    public List<UserProgress> getUserProgress(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userProgressRepository.findByUser(user);
    }
    
    public List<ConceptProgress> getConceptProgress(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return conceptProgressRepository.findByUser(user);
    }
    
    @Transactional
    public ConceptProgress toggleConceptCompleted(String userEmail, UUID conceptId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Concept concept = conceptRepository.findById(conceptId)
                .orElseThrow(() -> new RuntimeException("Concept not found"));

        ConceptProgress progress = conceptProgressRepository.findByUserAndConcept(user, concept)
                .orElse(ConceptProgress.builder()
                        .user(user)
                        .concept(concept)
                        .completed(false)
                        .build());

        progress.setCompleted(!progress.isCompleted());
        if (progress.isCompleted()) {
            progress.setCompletedAt(LocalDate.now());
            updateUserStreak(user);
        }
        return conceptProgressRepository.save(progress);
    }
    
    public Map<String, Object> getUserStats(String userEmail, String category) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UserProgress> allProgress = userProgressRepository.findByUserWithProblem(user);
        
        if (category != null && !category.isEmpty()) {
            allProgress = allProgress.stream()
                .filter(up -> category.equalsIgnoreCase(up.getProblem().getCategory()))
                .toList();
        }
        
        long completed = allProgress.stream().filter(UserProgress::isCompleted).count();
        long revision = allProgress.stream().filter(UserProgress::isRevision).count();
        long totalConcepts = 0;
        long completedConcepts = 0;
        
        if (category != null && !category.isEmpty()) {
            List<Concept> topLevelConcepts = conceptRepository.findByCategoryAndParentIdIsNullOrderByOrderIndexAsc(category);
            totalConcepts = topLevelConcepts.size();
            
            List<ConceptProgress> conceptProgresses = conceptProgressRepository.findByUserWithConcept(user);
            completedConcepts = conceptProgresses.stream()
                .filter(ConceptProgress::isCompleted)
                .filter(cp -> topLevelConcepts.stream().anyMatch(c -> c.getId().equals(cp.getConcept().getId())))
                .count();
        } else {
            // Global stats across all categories
            List<Concept> allTopLevelConcepts = conceptRepository.findAll().stream()
                .filter(c -> c.getParentId() == null)
                .toList();
            totalConcepts = allTopLevelConcepts.size();
            
            List<ConceptProgress> conceptProgresses = conceptProgressRepository.findByUserWithConcept(user);
            completedConcepts = conceptProgresses.stream()
                .filter(ConceptProgress::isCompleted)
                .filter(cp -> allTopLevelConcepts.stream().anyMatch(c -> c.getId().equals(cp.getConcept().getId())))
                .count();
        }
        
        return Map.of(
            "completed", completedConcepts,
            "revision", revision,
            "total", totalConcepts,
            "currentStreak", user.getCurrentStreak(),
            "maxStreak", user.getMaxStreak()
        );
    }

    public Map<String, Object> getUserAnalytics(String userEmail, String category) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UserProgress> allProgress = userProgressRepository.findByUserWithProblem(user);
        
        if (category != null && !category.isEmpty()) {
            allProgress = allProgress.stream()
                .filter(up -> category.equalsIgnoreCase(up.getProblem().getCategory()))
                .toList();
        }
        
        long easyCount = allProgress.stream().filter(up -> up.isCompleted() && "Easy".equalsIgnoreCase(up.getProblem().getDifficulty())).count();
        long mediumCount = allProgress.stream().filter(up -> up.isCompleted() && "Medium".equalsIgnoreCase(up.getProblem().getDifficulty())).count();
        long hardCount = allProgress.stream().filter(up -> up.isCompleted() && "Hard".equalsIgnoreCase(up.getProblem().getDifficulty())).count();

        double averageTime = allProgress.stream()
                .filter(up -> up.isCompleted() && up.getTimeSpent() != null)
                .mapToInt(UserProgress::getTimeSpent)
                .average()
                .orElse(0.0);

        return Map.of(
            "easy", easyCount,
            "medium", mediumCount,
            "hard", hardCount,
            "averageTime", averageTime
        );
    }

    public List<LocalDate> getHeatmap(String userEmail, String category) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (category != null && !category.isEmpty()) {
            return userProgressRepository.findCompletedDatesByUserAndCategory(user, category);
        }
        return userProgressRepository.findCompletedDatesByUser(user);
    }

    public List<UserProgress> getDueReviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userProgressRepository.findDueForReview(user, LocalDate.now());
    }
}
