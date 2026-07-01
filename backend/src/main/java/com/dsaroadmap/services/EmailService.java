package com.dsaroadmap.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setFrom("satyasaivanapalli47@gmail.com");

        if ("SIGNUP".equals(purpose)) {
            message.setSubject("Verify Your DSA Roadmap Account");
            message.setText("Welcome to DSA Roadmap!\n\nYour verification code is: " + otp + "\n\nThis code will expire in 10 minutes.");
        } else if ("FORGOT_PASSWORD".equals(purpose)) {
            message.setSubject("Reset Your DSA Roadmap Password");
            message.setText("You requested a password reset.\n\nYour verification code is: " + otp + "\n\nThis code will expire in 10 minutes.");
        } else if ("DELETE_ACCOUNT".equals(purpose)) {
            message.setSubject("Delete Your DSA Roadmap Account");
            message.setText("You requested to permanently delete your account.\n\nYour verification code is: " + otp + "\n\nIf you did not request this, please ignore this email.\nThis code will expire in 10 minutes.");
        }

        mailSender.send(message);
    }
}
