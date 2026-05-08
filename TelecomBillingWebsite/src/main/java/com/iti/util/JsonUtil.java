package com.iti.util;

public class JsonUtil {
    
    /**
     * Safely escapes a string to be embedded in a JSON value.
     * Prevents JSON syntax errors and basic injection when manually building JSON.
     */
    public static String escape(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\b", "\\b")
                    .replace("\f", "\\f")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}
