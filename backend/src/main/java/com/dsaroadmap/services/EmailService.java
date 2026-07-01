package com.dsaroadmap.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        String subject = "";
        String text = "";

        if ("SIGNUP".equals(purpose)) {
            subject = "Verify Your DSA Roadmap Account";
            text = "Welcome to DSA Roadmap!\n\nYour verification code is: " + otp + "\n\nThis code will expire in 10 minutes.";
        } else if ("FORGOT_PASSWORD".equals(purpose)) {
            subject = "Reset Your DSA Roadmap Password";
            text = "You requested a password reset.\n\nYour verification code is: " + otp + "\n\nThis code will expire in 10 minutes.";
        } else if ("DELETE_ACCOUNT".equals(purpose)) {
            subject = "Delete Your DSA Roadmap Account";
            text = "You requested to permanently delete your account.\n\nYour verification code is: " + otp + "\n\nIf you did not request this, please ignore this email.\nThis code will expire in 10 minutes.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> body = new HashMap<>();
        // Resend testing domain must be used if no custom domain is verified
        body.put("from", "DSA Roadmap <onboarding@resend.dev>");
        body.put("to", List.of(toEmail));
        body.put("subject", subject);
        body.put("text", text);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send email via Resend: " + e.getMessage());
            throw new RuntimeException("Failed to send email");
        }
    }
}
