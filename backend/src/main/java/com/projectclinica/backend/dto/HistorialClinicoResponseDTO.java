package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistorialClinicoResponseDTO {
    private Integer idHistorial;
    private Integer idCita;
    private LocalDateTime frechaCita;
    private String nombrePaciente;
    private String nombreMedico;
    private String nombreServicio;
    private String diagnostico;
    private String tratamiento;
    private String notas;
    private LocalDateTime frechaRegistro;
}
