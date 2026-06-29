package com.dsaroadmap.controllers;

import com.dsaroadmap.models.Problem;
import com.dsaroadmap.services.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }
    
    @GetMapping("/concept/{conceptId}")
    public ResponseEntity<List<Problem>> getProblemsByConcept(@PathVariable UUID conceptId) {
        return ResponseEntity.ok(problemService.getProblemsByConcept(conceptId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable UUID id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        return ResponseEntity.ok(problemService.createProblem(problem));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Problem> updateProblem(@PathVariable UUID id, @RequestBody Problem problem) {
        return ResponseEntity.ok(problemService.updateProblem(id, problem));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProblem(@PathVariable UUID id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}
