package com.dsaroadmap.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalSolution {
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String code;

    @com.fasterxml.jackson.annotation.JsonCreator(mode = com.fasterxml.jackson.annotation.JsonCreator.Mode.DELEGATING)
    public AdditionalSolution(String code) {
        this.name = "";
        this.code = code;
    }
}
