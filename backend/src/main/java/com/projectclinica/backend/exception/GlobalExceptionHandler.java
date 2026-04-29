package com.projectclinica.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;


@RestControllerAdvice // e dice a Spring que esta clase intercepta todos los errores de todos los Controllers
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        // se construye una respuesta limpia con el mensaje del error
        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        // captura cualquier otro error inesperado que no hayamos contemplado
        Map<String, Object> response = new HashMap<>();
        response.put("status", 500);
        response.put("mensaje", ex.getMessage());
        response.put("tipo", ex.getClass().getSimpleName());
        // response.put("mensaje", "ERROR interno del servidor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
