package com.projectclinica.backend.dto;

import lombok.Data;

@Data
public class EspecialidadResponseDTO {
    private Integer idEspecialidad;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}
