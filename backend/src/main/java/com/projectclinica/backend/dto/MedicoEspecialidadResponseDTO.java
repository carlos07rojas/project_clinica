package com.projectclinica.backend.dto;

import lombok.Data;

@Data
public class MedicoEspecialidadResponseDTO {
    private Integer id;
    private Integer idMedico;
    private String nombreMedico;
    private Integer idEspecialidad;
    private String nombreEspecialidad;
    private Boolean activo;
}
