package com.dsaroadmap.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "concept_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "concept_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConceptProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id", nullable = false)
    @JsonIgnore
    private Concept concept;

    @Column(name = "concept_id", insertable = false, updatable = false)
    private UUID conceptId;

    private boolean completed;

    private LocalDate completedAt;
}
