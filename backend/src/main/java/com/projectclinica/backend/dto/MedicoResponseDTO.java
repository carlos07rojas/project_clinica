package com.projectclinica.backend.dto;

import lombok.Data;

@Data
public class MedicoResponseDTO {
    private Integer idMedico;
    private String nombre;
    private String apellido;
    private String email;
    private String codigoColegiatura;
    private String telefono;
    private Integer idEspecialidad;
    private String nombreEspecialidad;
}
