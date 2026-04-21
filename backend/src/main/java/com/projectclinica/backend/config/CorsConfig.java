package com.projectclinica.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


@Configuration // le dice a spring que esta clase define configuraciones del sistema
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // permitir peticiones desde Angular en desarrollo
        config.addAllowedOrigin("http//localhost:4200");
        // permitir todos los métodos HTTP: GET, POST, PUT, PATCH, DELETE
        config.addAllowedMethod("*");
        // permitir todos los headers incluyendo Authorization para cuando agreguemos seguridad después
        config.addAllowedHeader("*");

        // aplicar esta configuración a todos los endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
