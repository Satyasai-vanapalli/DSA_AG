package com.dsaroadmap.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String difficulty; // Easy, Medium, Hard

    private String estimatedTime; // e.g., "30 mins"

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @ManyToMany
    @JoinTable(
        name = "problem_companies",
        joinColumns = @JoinColumn(name = "problem_id"),
        inverseJoinColumns = @JoinColumn(name = "company_id")
    )
    private List<Company> companies = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "problem_topics",
        joinColumns = @JoinColumn(name = "problem_id"),
        inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    private List<Topic> topics = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlatformLink> platformLinks = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProblemVideo> videos = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Solution> solutions = new ArrayList<>();
}
