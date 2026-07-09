package com.projectclinica.backend.dto;

import lombok.Data;

@Data
public class HistorialClinicoEditarDTO {
    private String diagnostico;
    private String tratamiento;
    private String notas;
}