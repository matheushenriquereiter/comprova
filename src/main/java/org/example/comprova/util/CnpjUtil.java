package org.example.comprova.util;

public class CnpjUtil {
    public static boolean isValid(String cnpj) {
        if (cnpj == null || cnpj.isEmpty()) return false;

        String cnpjDigits = cnpj.replaceAll("[^0-9]", "");

        if (cnpjDigits.length() != 14) return false;

        if (cnpjDigits.matches("(\\d)\\1{13}")) return false;

        int digit1 = calculateDigit(cnpjDigits, 5, 12);
        int digit2 = calculateDigit(cnpjDigits, 6, 13);

        return Character.getNumericValue(cnpjDigits.charAt(12)) == digit1
                && Character.getNumericValue(cnpjDigits.charAt(13)) == digit2;
    }

    private static int calculateDigit(String cnpjDigits, int initialWeight, int length) {
        int sum = 0;
        int weight = initialWeight;
        for (int i = 0; i < length; i++) {
            if (weight == 1) {
                weight = 9;
            }

            sum += Character.getNumericValue(cnpjDigits.charAt(i)) * weight;
            weight -= 1;
        }
        int digit;

        if (sum % 11 >= 2) {
            digit = 11 - sum % 11;
        } else {
            digit = 0;
        }

        return digit;
    }
}
