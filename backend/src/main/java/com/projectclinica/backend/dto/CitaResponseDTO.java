package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaResponseDTO {
    private Integer idCita;
    private Integer idPaciente;
    private String nombrePaciente;
    private Integer idMedico;
    private String nombreMedico;
    private Integer idServicio;
    private String nombreServicio;
    private LocalDateTime fechaHora;
    private Integer duracionMin;
    private String estado;
    private String observacion;
    private LocalDateTime fechaCreacion;
}
