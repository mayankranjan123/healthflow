package com.healthflow.exception;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.common.dto.ErrorDetail;
import com.healthflow.patient.service.PatientServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    // 1. Handle Resource Not Found Custom Exception
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // 2. Handle Invalid Workflows (Business rules violation)
    @ExceptionHandler(InvalidWorkflowException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidWorkflow(InvalidWorkflowException ex) {
        ApiResponse<Void> response = ApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 3. Handle Spring Bean Validation (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<ErrorDetail> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(new ErrorDetail(fieldName, errorMessage));
        });

        ApiResponse<Void> response = ApiResponse.error("Input validation failed", errors);
        return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // 4. Handle Spring Security Bad Credentials
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        ApiResponse<Void> response = ApiResponse.error("Invalid email or password combination");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // 4b. Handle Spring Security Account Disabled
    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabledAccount(org.springframework.security.authentication.DisabledException ex) {
        ApiResponse<Void> response = ApiResponse.error("User account is inactive. Please contact system support.");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // 4c. Handle Spring Security Account Locked
    @ExceptionHandler(org.springframework.security.authentication.LockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleLockedAccount(org.springframework.security.authentication.LockedException ex) {
        ApiResponse<Void> response = ApiResponse.error("User account is locked");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // 5. Handle Spring Security Access Denied
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        ApiResponse<Void> response = ApiResponse.error("You do not have permission to perform this action");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    // 6. Global Catch-all for Unexpected Runtime Errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        // Log the exception in real production logs (omitted trace in final API response)
        ApiResponse<Void> response = ApiResponse.error("An unexpected error occurred. Please contact system support.");
        log.error("Exception occurred: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
