package com.skillmatch.backend.auth.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.*;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.Set;

@Component
public class GoogleIdTokenVerifier {

    private final String clientId;
    private final ConfigurableJWTProcessor<SecurityContext> processor;

    public GoogleIdTokenVerifier(@Value("${app.oauth.google.clientId}") String clientId) throws MalformedURLException {
        this.clientId = clientId;

        URL jwksUrl = new URL("https://www.googleapis.com/oauth2/v3/certs");
        JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(jwksUrl);

        this.processor = new DefaultJWTProcessor<>();
        JWSKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(Set.of(JWSAlgorithm.RS256), keySource);
        this.processor.setJWSKeySelector(keySelector);
    }

    public GoogleUserInfo verify(String idToken) {
        try {
            SignedJWT.parse(idToken);

            JWTClaimsSet claims = processor.process(idToken, null);

            String iss = claims.getIssuer();
            if (!Objects.equals(iss, "https://accounts.google.com") && !Objects.equals(iss, "accounts.google.com")) {
                throw new IllegalArgumentException("Invalid issuer: " + iss);
            }
            if (claims.getAudience() == null || !claims.getAudience().contains(clientId)) {
                throw new IllegalArgumentException("Invalid audience");
            }
            Date exp = claims.getExpirationTime();
            if (exp == null || Instant.now().isAfter(exp.toInstant())) {
                throw new IllegalArgumentException("Token expired");
            }

            String email = claims.getStringClaim("email");
            Boolean emailVerified = claims.getBooleanClaim("email_verified");
            String givenName = claims.getStringClaim("given_name");
            String familyName = claims.getStringClaim("family_name");
            String sub = claims.getSubject(); // google user id

            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("Email missing in token");
            }

            return new GoogleUserInfo(sub, email.toLowerCase(), emailVerified != null && emailVerified, givenName, familyName);
        } catch (ParseException | BadJOSEException | JOSEException e) {
            throw new IllegalArgumentException("Invalid Google token", e);
        }
    }

    public record GoogleUserInfo(
            String googleSub,
            String email,
            boolean emailVerified,
            String firstName,
            String lastName
    ) {}
}
