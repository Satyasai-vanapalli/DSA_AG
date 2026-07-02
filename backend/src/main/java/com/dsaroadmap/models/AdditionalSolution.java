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

    @com.fasterxml.jackson.annotation.JsonCreator
    public static AdditionalSolution fromJson(com.fasterxml.jackson.databind.JsonNode node) {
        if (node.isTextual()) {
            return new AdditionalSolution("", node.asText());
        } else if (node.isObject()) {
            String name = node.has("name") && !node.get("name").isNull() ? node.get("name").asText() : "";
            String code = node.has("code") && !node.get("code").isNull() ? node.get("code").asText() : "";
            return new AdditionalSolution(name, code);
        }
        return new AdditionalSolution();
    }
}
