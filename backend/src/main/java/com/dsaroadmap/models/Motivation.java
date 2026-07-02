package com.dsaroadmap.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "motivations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Motivation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String type; // QUOTE, IMAGE, VIDEO, LINK

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // text content for QUOTE or LINK, file path for IMAGE/VIDEO

    @Column(columnDefinition = "TEXT")
    private String author; // optional, for quotes

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
