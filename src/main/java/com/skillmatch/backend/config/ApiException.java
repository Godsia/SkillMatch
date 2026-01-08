package com.skillmatch.backend.config;

public class ApiException extends RuntimeException {
    public ApiException(String message) { super(message); }
}
