package com.dsaroadmap.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "solutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String language; // C, C++, Java, Python, Kotlin

    @Column(columnDefinition = "TEXT")
    private String bruteSolution;

    @Column(columnDefinition = "TEXT")
    private String betterSolution;

    @Column(columnDefinition = "TEXT")
    private String optimalSolution;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private com.fasterxml.jackson.databind.JsonNode additionalSolutions;

    // Legacy column to satisfy existing NOT NULL constraint in production database
    @Column(name = "solution_code", columnDefinition = "TEXT")
    @Builder.Default
    @JsonIgnore
    private String solutionCode = "";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnore
    private Problem problem;
}
