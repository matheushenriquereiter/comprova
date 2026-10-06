package org.example.comprova.util;

public class BearerTokenUtil {
    private BearerTokenUtil() {
    }

    public static String extractToken(String bearerToken) {
        return bearerToken.replace("Bearer ", "");
    }
}
