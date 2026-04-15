package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

// aqui el sistema devolvera datos sobre un usuario
@Data
public class UsuarioResponseDTO {
    private Integer idUsuario;
    private String nombre;
    private String apellido;
    private String email;
    // se devuelve rol para saber que usuario puede operar o esta bloqueado en ciertas screans
    private String rol;
    // se devuelve activo para saber si el usuario puede operar o ser bloqueado
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}
