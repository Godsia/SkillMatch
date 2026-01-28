package com.skillmatch.backend.auth.email;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;

import java.io.InputStream;
import java.util.Properties;


@Slf4j
@Configuration
@Profile("local")
public class NoOpMailConfig {

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return new MimeMessage(Session.getDefaultInstance(new Properties()));
            }

            @Override
            public MimeMessage createMimeMessage(InputStream contentStream) {
                try {
                    return new MimeMessage(Session.getDefaultInstance(new Properties()), contentStream);
                } catch (Exception e) {
                    return createMimeMessage();
                }
            }

            @Override
            public void send(MimeMessage mimeMessage) throws MailException {
                log.info("[local] email sending skipped (MimeMessage)");
            }

            @Override
            public void send(MimeMessage... mimeMessages) throws MailException {
                log.info("[local] email sending skipped ({} messages)", mimeMessages == null ? 0 : mimeMessages.length);
            }

            @Override
            public void send(MimeMessagePreparator mimeMessagePreparator) throws MailException {
                log.info("[local] email sending skipped (MimeMessagePreparator)");
            }

            @Override
            public void send(MimeMessagePreparator... mimeMessagePreparators) throws MailException {
                log.info("[local] email sending skipped ({} preparators)", mimeMessagePreparators == null ? 0 : mimeMessagePreparators.length);
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) throws MailException {
                log.info("[local] email sending skipped to={} subject={} ",
                        simpleMessage == null ? null : String.join(",", safe(simpleMessage.getTo())),
                        simpleMessage == null ? null : simpleMessage.getSubject());
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) throws MailException {
                log.info("[local] email sending skipped ({} simple messages)", simpleMessages == null ? 0 : simpleMessages.length);
            }

            private String[] safe(String[] arr) {
                return arr == null ? new String[0] : arr;
            }
        };
    }
}
