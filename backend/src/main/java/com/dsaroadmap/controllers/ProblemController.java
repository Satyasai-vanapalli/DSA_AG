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

    @GetMapping("/search")
    public ResponseEntity<List<Problem>> searchProblems(@RequestParam String q) {
        return ResponseEntity.ok(problemService.searchProblems(q));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Problem>> filterProblems(@RequestParam String difficulty) {
        return ResponseEntity.ok(problemService.filterProblems(difficulty));
    }

    @GetMapping("/concept/{conceptId}")
    public ResponseEntity<List<Problem>> getProblemsByConcept(@PathVariable UUID conceptId) {
        return ResponseEntity.ok(problemService.getProblemsByConcept(conceptId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Problem>> getProblemsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(problemService.getProblemsByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable UUID id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, #problem.category)")
    public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        return ResponseEntity.ok(problemService.createProblem(problem));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditProblem(authentication, #id, @problemRepository)")
    public ResponseEntity<Problem> updateProblem(@PathVariable UUID id, @RequestBody Problem problem) {
        return ResponseEntity.ok(problemService.updateProblem(id, problem));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditProblem(authentication, #id, @problemRepository)")
    public ResponseEntity<Void> deleteProblem(@PathVariable UUID id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canReorderProblems(authentication, #problemIds, @problemRepository)")
    public ResponseEntity<Void> reorderProblems(@RequestBody List<UUID> problemIds) {
        problemService.reorderProblems(problemIds);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/move")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditProblem(authentication, #id, @problemRepository)")
    public ResponseEntity<Problem> moveProblem(@PathVariable UUID id, @RequestBody java.util.Map<String, String> body) {
        String conceptIdStr = body.get("conceptId");
        UUID conceptId = (conceptIdStr != null && !conceptIdStr.isEmpty() && !conceptIdStr.equalsIgnoreCase("null")) ? UUID.fromString(conceptIdStr) : null;
        return ResponseEntity.ok(problemService.moveProblemToConcept(id, conceptId));
    }
}
