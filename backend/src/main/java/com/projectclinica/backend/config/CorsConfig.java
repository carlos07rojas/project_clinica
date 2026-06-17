package com.projectclinica.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // le dice a spring que esta clase define configuraciones del sistema
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // permite peticiones desde Angular
                        .allowedOrigins("http://localhost:4200")
                        // permite todos los métodos HTTP
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        // permite todos los headers
                        .allowedHeaders("*")
                        // permite credenciales
                        .allowCredentials(true)
                        // cachea el preflight 1 hora
                        .maxAge(3600);
            }
        };
    }
}