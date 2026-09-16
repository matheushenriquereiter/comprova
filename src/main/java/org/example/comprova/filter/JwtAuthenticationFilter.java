package org.example.comprova.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.comprova.model.User;
import org.example.comprova.repository.UserRepository;
import org.example.comprova.service.JwtService;
import org.example.comprova.util.BearerTokenUtil;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            authenticateRequest(request, response);
        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    public void authenticateRequest(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken == null) {
            return;
        }

        String token = BearerTokenUtil.extractToken(bearerToken);
        if (!jwtService.isTokenValid(token)) {
            return;
        }

        String username = jwtService.extractUsername(token);
        User user = userRepository.getUserByUsername(username).orElse(null);
        if (user == null) {
            return;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}