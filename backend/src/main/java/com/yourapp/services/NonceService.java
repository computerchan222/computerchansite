package com.yourapp.services;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NonceService {
    private final Map<String, NonceData> nonceStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generateNonce(String address) {
        String nonce = String.valueOf(100000 + random.nextInt(900000)); // 6-digit code
        nonceStore.put(address.toLowerCase(), new NonceData(nonce, Instant.now(), false));
        return nonce;
    }

    public boolean validateNonce(String address, String nonce) {
        NonceData data = nonceStore.get(address.toLowerCase());
        if (data == null || data.used) return false;
        // Optional: Expire after 5 minutes
        if (Instant.now().isAfter(data.createdAt.plusSeconds(300))) return false;
        boolean valid = data.nonce.equals(nonce);
        if (valid) data.used = true; // mark as used
        return valid;
    }

    private static class NonceData {
        String nonce;
        Instant createdAt;
        boolean used;

        NonceData(String nonce, Instant createdAt, boolean used) {
            this.nonce = nonce;
            this.createdAt = createdAt;
            this.used = used;
        }
    }
} 