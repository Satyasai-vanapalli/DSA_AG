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
@Table(name = "concepts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Concept {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "concept", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Problem> problems = new ArrayList<>();
}
