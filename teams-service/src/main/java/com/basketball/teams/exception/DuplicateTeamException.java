package com.basketball.teams.exception;

public class DuplicateTeamException extends RuntimeException {
    public DuplicateTeamException(String message) {
        super(message);
    }
}
