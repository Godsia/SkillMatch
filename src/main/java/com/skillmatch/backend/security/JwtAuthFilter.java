package com.skillmatch.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        if (path.equals("/auth/register/verify-email") || path.equals("/auth/register/set-password")) {
            return false;
        }
        return path.startsWith("/auth/");
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            Long userId = jwtService.parseUserId(token);

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    userId, null, List.of()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("Authenticated userId={} for {} {}", userId, request.getMethod(), request.getServletPath());

        } catch (Exception e) {
            log.warn("JWT authentication failed for {} {}: {}", request.getMethod(), request.getServletPath(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
