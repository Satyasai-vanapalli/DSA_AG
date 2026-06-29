package com.dsaroadmap.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
@Data @AllArgsConstructor public class TokenRefreshResponse {
    private String accessToken;
    private String refreshToken;
}
