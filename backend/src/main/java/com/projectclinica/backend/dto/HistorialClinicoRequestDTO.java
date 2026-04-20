package com.projectclinica.backend.dto;

import lombok.Data;

@Data
public class HistorialClinicoRequestDTO {
    private Integer idCita;
    private String diagnostico;
    private String tratamiento;
    private String notas;
}
