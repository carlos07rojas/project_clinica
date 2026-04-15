package com.projectclinica.backend.dto;

import lombok.Data;

// en estas clases se establece que datos puede crear el usuario, estas solo seran los campos que el cliente debe tener acceso
@Data
public class UsuarioRequestDTO {
    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private String rol;
}
