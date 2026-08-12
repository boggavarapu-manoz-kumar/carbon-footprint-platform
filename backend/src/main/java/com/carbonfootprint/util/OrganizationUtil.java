package com.carbonfootprint.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

public class OrganizationUtil {
    
    private static final SecureRandom secureRandom = new SecureRandom();

    public static String generateUniqueCode(String organizationName) {
        String base = organizationName.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (base.length() > 5) {
            base = base.substring(0, 5);
        }
        int randomNum = 1000 + secureRandom.nextInt(9000); // 4 digit random number
        return base + "-" + randomNum;
    }

    public static String generateInvitationToken() {
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
