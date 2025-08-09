package com.yourapp.services;

import org.springframework.stereotype.Service;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Service
public class AuthService {

    public boolean verifySignature(String message, String signature, String expectedAddress) {
        try {
            System.out.println("Received message: '" + message + "'");
            System.out.println("Received signature: " + signature);
            System.out.println("Expected address: " + expectedAddress);
            
            // Add Ethereum signed message prefix
            String prefix = "\u0019Ethereum Signed Message:\n" + message.length();
            byte[] msgHash = (prefix + message).getBytes(StandardCharsets.UTF_8);

            // Parse the signature (r, s, v)
            Sign.SignatureData sigData = parseSignature(signature);

            // Recover public key
            BigInteger publicKey = Sign.signedMessageToKey(msgHash, sigData);
            String recoveredAddress = "0x" + Keys.getAddress(publicKey);

            // Compare recovered address with expected
            System.out.println("Recovered: " + recoveredAddress);
            System.out.println("Expected: " + expectedAddress);
            return recoveredAddress.equalsIgnoreCase(expectedAddress);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private Sign.SignatureData parseSignature(String signature) {
        byte[] sigBytes = Numeric.hexStringToByteArray(signature);
        byte v = sigBytes[64];
        if (v < 27) v += 27; // Fix v if needed
        byte[] r = Arrays.copyOfRange(sigBytes, 0, 32);
        byte[] s = Arrays.copyOfRange(sigBytes, 32, 64);
        return new Sign.SignatureData(v, r, s);
    }
}
