package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaRequestDTO {
    private Integer idPaciente;
    private Integer idMedico;
    private Integer idServicio;
    private LocalDateTime fechaHora;
    private String observaciones;
}
