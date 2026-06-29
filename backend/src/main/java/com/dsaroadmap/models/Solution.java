package com.dsaroadmap.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

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

    @Column(columnDefinition = "TEXT", nullable = false)
    private String solutionCode;

    @Column(columnDefinition = "TEXT")
    private String approach;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private String timeComplexity;

    private String spaceComplexity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;
}
