package org.example.comprova.util;

public class BearerTokenUtil {
    private BearerTokenUtil() {
    }

    public static String extractToken(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7).trim();
        }
        return null;
    }
}
