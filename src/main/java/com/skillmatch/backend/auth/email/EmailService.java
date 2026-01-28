package com.skillmatch.backend.auth.email;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.logCodes:false}")
    private boolean logCodes;

    public void sendVerificationCode(String to, String code) {
        if (logCodes) {
            log.info("[DEV] Email verification code for {}: {}", to, code);
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("SkillMatch verification code");
        msg.setText("Your verification code: " + code + "\nIt expires in 10 minutes.");

        mailSender.send(msg);
    }
}
